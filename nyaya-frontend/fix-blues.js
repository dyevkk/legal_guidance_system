const fs = require('fs');
const path = require('path');

const replacements = {
    '#0d1e38': '#151517',
    'rgba(17,34,64': 'rgba(42,42,46',
    'rgba(17, 34, 64': 'rgba(42, 42, 46',
    'rgba(10,22,40': 'rgba(14,14,16',
    'rgba(10, 22, 40': 'rgba(14, 14, 16',
    'rgba(26,47,82': 'rgba(21,21,23',
    'rgba(26, 47, 82': 'rgba(21, 21, 23',
};

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./app');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    for (const [oldStr, newStr] of Object.entries(replacements)) {
        content = content.split(oldStr).join(newStr);
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
});
console.log('Done.');
