function escapeHtml(html) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return html.replace(/[&<>"']/g, m => map[m]);
}

export function parseMarkdown(md) {
    const lines = md.split(/\r?\n/);
    let html = '';
    let inCodeBlock = false;
    let codeBlockLang = '';
    let listType = null;
    let listBuffer = [];
    let blockquoteBuffer = [];
    let paragraphBuffer = [];

    function flushList() {
        if (listBuffer.length) {
            const tag = listType === 'ul' ? 'ul' : 'ol';
            html += `<${tag}>${listBuffer.join('')}</${tag}>\n`;
            listBuffer = [];
            listType = null;
        }
    }

    function flushBlockquote() {
        if (blockquoteBuffer.length) {
            html += `<blockquote>${parseMarkdown(blockquoteBuffer.join('\n'))}</blockquote>\n`;
            blockquoteBuffer = [];
        }
    }

    function flushParagraph() {
        if (paragraphBuffer.length) {
            html += `<p>${inlineMarkdown(paragraphBuffer.join(' '))}</p>\n`;
            paragraphBuffer = [];
        }
    }


    function inlineMarkdown(text) {
        text = escapeHtml(text);

        // // Task list items
        // text = text.replace(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)/, (_, checked, item) => {
        //     const isChecked = checked.toLowerCase() === 'x' ? 'checked' : '';
        //     return `<input type="checkbox" disabled ${isChecked}> ${item}`;
        // });

        // Images (must come before links)
        text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');

        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Bold and Italic
        text = text.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>');
        text = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
        text = text.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

        // Inline code
        text = text.replace(/`([^`]+?)`/g, '<code>$1</code>');

        return text;
    }


    for (let line of lines) {
        if (line.trim() === '') {
            flushParagraph();
            flushList();
            flushBlockquote();
            continue;
        }

    // Code block (fenced)
    if (line.startsWith('```')) {
        if (!inCodeBlock) {
            inCodeBlock = true;
            codeBlockLang = line.slice(3).trim();
            html += `<pre><code${codeBlockLang ? ` class="language-${codeBlockLang}"` : ''}>\n`;
        } else {
            inCodeBlock = false;
            html += '</code></pre>\n';
        }
        continue;
    }

    if (inCodeBlock) {
        html += escapeHtml(line) + '\n';
        continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
        flushParagraph();
        const level = headingMatch[1].length;
        html += `<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>\n`;
        continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
        flushParagraph();
        html += '<hr>\n';
        continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
        blockquoteBuffer.push(line.replace(/^>\s?/, ''));
        continue;
    } else {
        flushBlockquote();
    }

    // // Lists
    // const ulMatch = line.match(/^\s*[-+*]\s+(.*)/);
    // const olMatch = line.match(/^\s*\d+\.\s+(.*)/);
    // if (ulMatch || olMatch) {
    //     const item = `<li>${inlineMarkdown(ulMatch ? ulMatch[1] : olMatch[1])}</li>`;
    //     const currentType = ulMatch ? 'ul' : 'ol';
    //     if (listType && listType !== currentType) flushList();
    //     listType = currentType;
    //     listBuffer.push(item);
    //     continue;
    // } else {
    //     flushList();
    // }

    // Lists
    const ulMatch = line.match(/^\s*[-+*]\s+(.*)/);
    const olMatch = line.match(/^\s*\d+\.\s+(.*)/);
    if (ulMatch || olMatch) {
        const currentType = ulMatch ? 'ul' : 'ol';
        if (listType && listType !== currentType) flushList();
        listType = currentType;

        let content = ulMatch ? ulMatch[1] : olMatch[1];

        // Check for task list item
        const taskMatch = content.match(/^\[( |x|X)\]\s+(.*)/);
        if (taskMatch) {
            const checked = taskMatch[1].toLowerCase() === 'x' ? 'checked' : '';
            const label = inlineMarkdown(taskMatch[2]);
            listBuffer.push(`<li><input type="checkbox" disabled ${checked}> ${label}</li>`);
        } else {
            listBuffer.push(`<li>${inlineMarkdown(content)}</li>`);
        }

        continue;
    } else {
        flushList();
    }

    // Default to paragraph
    paragraphBuffer.push(line);
    }

    // Flush remaining buffers
    flushParagraph();
    flushList();
    flushBlockquote();
    if (inCodeBlock) html += '</code></pre>\n';

    return html.trim();
}

// // Example usage:
// const markdownText = `
// # Hello Markdown

// **Bold**, *italic*, and ***both***.

// Inline code: \`console.log("Hello")\`

// > A blockquote with a [link](https://example.com)

// 1. First item
// 2. Second item

// - Unordered
// - List

// ---

// \`\`\`js
// function test() {
//     return true;
// }
// \`\`\`
// `;

// document.body.innerHTML = parseMarkdown(markdownText);
