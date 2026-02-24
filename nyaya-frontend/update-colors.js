const fs = require('fs');
const path = require('path');

const replacements = {
    // Primary Backgrounds
    '#0A0A0A': '#0E0E10',
    '#0a0a0a': '#0E0E10',

    // Mid Backgrounds
    '#1A1A1A': '#151517',
    '#1a1a1a': '#151517',

    // Cards / Borders
    '#2E2E2E': '#2A2A2E',
    '#2e2e2e': '#2A2A2E',

    // Gold Accents
    '#C6A14A': '#C9A227',
    '#c6a14a': '#C9A227',
    '#DFBD69': '#E0C56E', // Lighter gold adjusted
    '#dfbd69': '#E0C56E',

    // Primary Text
    '#F4EDE4': '#F1E8D8',
    '#f4ede4': '#F1E8D8',

    // Text Secondary (leaving it or slightly warm) 
    '#D1C7BB': '#D4CCBE',
    '#d1c7bb': '#D4CCBE',

    // RGBA variations from previous replacements
    'rgba(198, 161, 74': 'rgba(201, 162, 39',
    'rgba(198,161,74': 'rgba(201,162,39',
    'rgba(46, 46, 46': 'rgba(42, 42, 46',
    'rgba(46,46,46': 'rgba(42,42,46',
    'rgba(10, 10, 10': 'rgba(14, 14, 16',
    'rgba(10,10,10': 'rgba(14,14,16',
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
