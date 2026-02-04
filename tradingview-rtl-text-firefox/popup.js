// Settings object with VERSION
const DEFAULT_SETTINGS = {
  version: 2, // Increment this when you change defaults
  fontWeight: 500,
  fontSize: 20,
  lineHeight: 1.2,
  textColor: '#000000',
  bgColor: '#ffffff',
  bgOpacity: 52,
  fillBg: true,
  showBorder: false,
  borderColor: '#000000',
  borderWidth: 2,
  padding: 10,
  wrapText: false,
  maxWidth: 800,
  rtlMode: true,
  savedText: 'اینجا متن بنویسید',
  autoPaste: false,
  borderRadius: true  
};

let settings = { ...DEFAULT_SETTINGS };


// Track cursor position and selection
let cursorPosition = 0;
let savedSelection = null;

// Material Design Color Palette (reduced to 3 shades per color)
const MATERIAL_COLORS = {
  red: ['#EF9A9A', '#EF5350', '#D32F2F'],
  pink: ['#F48FB1', '#EC407A', '#C2185B'],
  purple: ['#CE93D8', '#AB47BC', '#7B1FA2'],
  blue: ['#90CAF9', '#42A5F5', '#1976D2'],
  cyan: ['#80DEEA', '#26C6DA', '#0097A7'],
  green: ['#A5D6A7', '#66BB6A', '#388E3C'],
  yellow: ['#FFF59D', '#FFEE58', '#FBC02D'],
  orange: ['#FFCC80', '#FFA726', '#F57C00'],
  grey: ['#E0E0E0', '#9E9E9E', '#616161']
};

// Quick access emojis
const QUICK_EMOJIS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '✅', '❌', '⚠️', '←', '↑', '→', '↓', '✓' , '✗', '■', '●'];

// Extended emoji collection for modal
const EMOJIS = [
  '☑️', '✔️', '🔔', '👈', '👉', '👆', '👇', '☝️', '⛔️',
  '🟢', '🔴', '⚪️', '⚫️', '🟤', '🔳', '🔲', '▪️', '▫️', '🟠', '🧲',
  '⚖️', '⏰', '📌', '📍', '❗️', '❕', '❓', '❔', '‼️', '⁉️',
  '↕️', '↔️', '📈', '📉', '🔍', '👁', '📝', '📅'
];

const UNICODE_CHARS = [
  '⇒', '⇐', '⇑', '⇔', '⮕', '➜', '➔', '➡', '⬅', '⬆',
  '⬇', '∗', '−', '+', '×', '=', '≠', '◦', '∙', '●',
  '○', '■', '□', '►', '◄', '—', '―', '⸺', '★', '☆',
  '✓', '✔', '✗', '✘'
];

// Save selection
function saveSelection() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedSelection = selection.getRangeAt(0).cloneRange();
    return true;
  }
  return false;
}

// Restore selection
function restoreSelection() {
  if (savedSelection) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelection);
    return true;
  }
  return false;
}

// Load settings with migration support
function loadSettings() {
  const saved = localStorage.getItem('rtl_text_settings');
  
  if (saved) {
    try {
      const savedSettings = JSON.parse(saved);
      
      // Check if settings need migration
      if (!savedSettings.version || savedSettings.version < DEFAULT_SETTINGS.version) {
        console.log('Migrating settings from version', savedSettings.version || 0, 'to', DEFAULT_SETTINGS.version);
        
        // Merge: new defaults + old user customizations
        settings = {
          ...DEFAULT_SETTINGS,  // Start with new defaults
          ...savedSettings,      // Override with saved values
          version: DEFAULT_SETTINGS.version  // Update version
        };
        
        saveSettings(); // Save migrated settings
      } else {
        settings = { ...DEFAULT_SETTINGS, ...savedSettings };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
      settings = { ...DEFAULT_SETTINGS };
    }
  } else {
    // No saved settings, use defaults
    settings = { ...DEFAULT_SETTINGS };
    saveSettings(); // Save defaults for first run
  }
  
  applySettingsToUI();
}

// Save settings
function saveSettings() {
  localStorage.setItem('rtl_text_settings', JSON.stringify(settings));
}

// Apply settings to UI
function applySettingsToUI() {
  document.getElementById('fontSizeDisplay').textContent = settings.fontSize;
  document.getElementById('lineHeightDisplay').textContent = settings.lineHeight;
  document.getElementById('textColor').value = settings.textColor;
  document.getElementById('bgColor').value = settings.bgColor;
  document.getElementById('bgOpacity').value = settings.bgOpacity;
  document.getElementById('bgOpacityValue').textContent = settings.bgOpacity + '%';
  document.getElementById('fillBg').checked = settings.fillBg;
  document.getElementById('showBorder').checked = settings.showBorder;
  document.getElementById('borderColor').value = settings.borderColor;
  document.getElementById('borderWidthDisplay').textContent = settings.borderWidth;
  document.getElementById('paddingDisplay').textContent = settings.padding;
  document.getElementById('wrapText').checked = settings.wrapText;
  document.getElementById('maxWidth').value = settings.maxWidth;
  document.getElementById('maxWidthValue').textContent = settings.maxWidth + 'px';
  document.getElementById('rtlMode').checked = settings.rtlMode;
  document.getElementById('autoPaste').checked = settings.autoPaste;
  document.getElementById('borderRadius').checked = settings.borderRadius;
  
  // Restore saved text with colors
  const editor = document.getElementById('textInput');
  if (settings.savedText) {
    editor.innerHTML = settings.savedText;
  }
  
  updateWrapControlState();
  updateTextareaStyle();
}

// Update wrap control visibility
function updateWrapControlState() {
  const wrapControl = document.getElementById('wrapControl');
  if (settings.wrapText) {
    wrapControl.classList.remove('disabled');
  } else {
    wrapControl.classList.add('disabled');
  }
}

// Update textarea style
function updateTextareaStyle() {
  const editor = document.getElementById('textInput');
  
  editor.style.fontFamily = 'Vazirmatn, Arial, sans-serif';
  editor.style.fontWeight = settings.fontWeight;
  editor.style.fontSize = settings.fontSize + 'px';
  editor.style.lineHeight = settings.lineHeight;
  editor.style.color = settings.textColor;
  
  editor.style.direction = settings.rtlMode ? 'rtl' : 'ltr';
  editor.style.textAlign = settings.rtlMode ? 'right' : 'left';
  
  if (settings.wrapText) {
    editor.style.width = settings.maxWidth + 'px';
    editor.style.maxWidth = settings.maxWidth + 'px';
    editor.style.whiteSpace = 'pre-wrap';
  } else {
    editor.style.width = '';
    editor.style.maxWidth = 'none';
    editor.style.whiteSpace = 'pre';
  }
  
  if (settings.fillBg) {
    const opacity = settings.bgOpacity / 100;
    const rgb = hexToRgb(settings.bgColor);
    editor.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  } else {
    editor.style.backgroundColor = 'transparent';
  }
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Get plain text from contenteditable
function getPlainText(element) {
  let text = '';
  
  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        text += '\n';
      } else if (node.tagName === 'DIV') {
        if (text && !text.endsWith('\n')) {
          text += '\n';
        }
        for (let child of node.childNodes) {
          processNode(child);
        }
      } else {
        for (let child of node.childNodes) {
          processNode(child);
        }
      }
    }
  }
  
  processNode(element);
  return text;
}

// Get text segments with colors
function getTextSegments(element) {
  const segments = [];
  
  function processNode(node, inheritedColor = null) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        segments.push({
          text: text,
          color: inheritedColor || settings.textColor
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const nodeColor = node.style.color || inheritedColor;
      
      if (node.tagName === 'BR') {
        segments.push({ text: '\n', color: inheritedColor || settings.textColor });
      } else if (node.tagName === 'DIV') {
        if (segments.length > 0 && segments[segments.length - 1].text !== '\n') {
          segments.push({ text: '\n', color: inheritedColor || settings.textColor });
        }
        for (let child of node.childNodes) {
          processNode(child, nodeColor);
        }
      } else {
        for (let child of node.childNodes) {
          processNode(child, nodeColor);
        }
      }
    }
  }
  
  processNode(element);
  return segments;
}

// Helper function to wrap text lines
function wrapTextLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

function generateImage(callback) {
  const editor = document.getElementById('textInput');
  const segments = getTextSegments(editor);
  
  if (segments.length === 0 || segments.every(s => !s.text.trim())) {
    return null;
  }
  
  try {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.font = `${settings.fontWeight} ${settings.fontSize}px Vazirmatn, Arial`;
    ctx.direction = settings.rtlMode ? 'rtl' : 'ltr';
    
    // Process segments into lines
    let processedLines = [];
    
    if (settings.wrapText) {
      const effectiveMaxWidth = settings.maxWidth - (settings.padding * 2) - (settings.showBorder ? settings.borderWidth * 2 : 0);
      
      let currentLineSegments = [];
      let currentLineWidth = 0;
      
      segments.forEach(segment => {
        const lines = segment.text.split('\n');
        
        lines.forEach((lineText, lineIndex) => {
          if (lineIndex > 0) {
            if (currentLineSegments.length > 0) {
              processedLines.push(currentLineSegments);
              currentLineSegments = [];
              currentLineWidth = 0;
            }
          }
          
          if (lineText) {
            const words = lineText.split(' ');
            words.forEach((word, wordIndex) => {
              const wordWithSpace = wordIndex < words.length - 1 ? word + ' ' : word;
              const wordWidth = ctx.measureText(wordWithSpace).width;
              
              if (currentLineWidth + wordWidth > effectiveMaxWidth && currentLineSegments.length > 0) {
                processedLines.push(currentLineSegments);
                currentLineSegments = [];
                currentLineWidth = 0;
              }
              
              currentLineSegments.push({
                text: wordWithSpace,
                color: segment.color,
                width: wordWidth
              });
              currentLineWidth += wordWidth;
            });
          } else if (lineIndex > 0) {
            processedLines.push([]);
          }
        });
      });
      
      if (currentLineSegments.length > 0) {
        processedLines.push(currentLineSegments);
      }
    } else {
      let currentLineSegments = [];
      segments.forEach(segment => {
        const lines = segment.text.split('\n');
        lines.forEach((lineText, lineIndex) => {
          if (lineIndex > 0) {
            processedLines.push(currentLineSegments);
            currentLineSegments = [];
          }
          if (lineText) {
            currentLineSegments.push({
              text: lineText,
              color: segment.color,
              width: ctx.measureText(lineText).width
            });
          } else if (lineIndex > 0) {
            processedLines.push([]);
          }
        });
      });
      if (currentLineSegments.length > 0) {
        processedLines.push(currentLineSegments);
      }
    }
    
    // Calculate dimensions
    const lineHeight = settings.fontSize * settings.lineHeight;
    let maxLineWidth = 0;
    
    processedLines.forEach(line => {
      const lineWidth = line.reduce((sum, seg) => sum + seg.width, 0);
      maxLineWidth = Math.max(maxLineWidth, lineWidth);
    });
    
    const textWidth = maxLineWidth;
    const textHeight = processedLines.length * lineHeight;
    
    const canvasWidth = textWidth + (settings.padding * 2) + (settings.showBorder ? settings.borderWidth * 2 : 0);
    const canvasHeight = textHeight + (settings.padding * 2) + (settings.showBorder ? settings.borderWidth * 2 : 0);
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    ctx.font = `${settings.fontWeight} ${settings.fontSize}px Vazirmatn, Arial`;
    ctx.textBaseline = 'top';
    ctx.direction = settings.rtlMode ? 'rtl' : 'ltr';
    
    // Fill background
    if (settings.fillBg) {
      const opacity = settings.bgOpacity / 100;
      const rgb = hexToRgb(settings.bgColor);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
      if (settings.borderRadius) {
        const radius = 10;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvasWidth - radius, 0);
        ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, radius);
        ctx.lineTo(canvasWidth, canvasHeight - radius);
        ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - radius, canvasHeight);
        ctx.lineTo(radius, canvasHeight);
        ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }
    
    // Draw border
    if (settings.showBorder) {
      ctx.strokeStyle = settings.borderColor;
      ctx.lineWidth = settings.borderWidth;
      if (settings.borderRadius) {
        const radius = 10;
        ctx.beginPath();
        ctx.moveTo(radius, settings.borderWidth / 2);
        ctx.lineTo(canvasWidth - radius, settings.borderWidth / 2);
        ctx.quadraticCurveTo(canvasWidth - settings.borderWidth / 2, settings.borderWidth / 2, canvasWidth - settings.borderWidth / 2, radius);
        ctx.lineTo(canvasWidth - settings.borderWidth / 2, canvasHeight - radius);
        ctx.quadraticCurveTo(canvasWidth - settings.borderWidth / 2, canvasHeight - settings.borderWidth / 2, canvasWidth - radius, canvasHeight - settings.borderWidth / 2);
        ctx.lineTo(radius, canvasHeight - settings.borderWidth / 2);
        ctx.quadraticCurveTo(settings.borderWidth / 2, canvasHeight - settings.borderWidth / 2, settings.borderWidth / 2, canvasHeight - radius);
        ctx.lineTo(settings.borderWidth / 2, radius);
        ctx.quadraticCurveTo(settings.borderWidth / 2, settings.borderWidth / 2, radius, settings.borderWidth / 2);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.strokeRect(settings.borderWidth / 2, settings.borderWidth / 2, canvasWidth - settings.borderWidth, canvasHeight - settings.borderWidth);
      }
    }
    
    // Draw text
    const startX = settings.padding + (settings.showBorder ? settings.borderWidth : 0);
    const startY = settings.padding + (settings.showBorder ? settings.borderWidth : 0);
    
    processedLines.forEach((line, lineIndex) => {
      const y = startY + (lineIndex * lineHeight);
      
      let x;
      if (settings.rtlMode) {
        x = canvasWidth - startX;
      } else {
        x = startX;
      }
      
      line.forEach(segment => {
        ctx.fillStyle = segment.color;
        
        if (settings.rtlMode) {
          ctx.textAlign = 'right';
          ctx.fillText(segment.text, x, y);
          x -= segment.width;
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(segment.text, x, y);
          x += segment.width;
        }
      });
    });
    
    return canvas;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  toastMessage.textContent = message;
  toast.className = 'toast show';
  
  if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
  } else {
    toast.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      toast.classList.remove('show');
      toast.style.animation = '';
    }, 300);
  }, 3000);
}

function insertAtCursor(text) {
  const editor = document.getElementById('textInput');
  editor.focus();
  
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  
  settings.savedText = editor.innerHTML;
  saveSettings();
}

function applyColorToSelection(color) {
  const editor = document.getElementById('textInput');
  const selection = window.getSelection();
  
  if (selection.rangeCount > 0 && !selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    
    const span = document.createElement('span');
    span.style.color = color;
    
    try {
      range.surroundContents(span);
    } catch (e) {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
    
    settings.savedText = editor.innerHTML;
    saveSettings();
  }
  
  settings.textColor = color;
  saveSettings();
}

function initQuickEmojis() {
  const container = document.getElementById('quickEmojiContainer');
  container.innerHTML = '';
  
  QUICK_EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'quick-emoji';
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      insertAtCursor(emoji);
    });
    container.appendChild(btn);
  });
}

function initEmojiPicker() {
  const grid = document.getElementById('emojiGrid');
  grid.innerHTML = '';
  
  EMOJIS.forEach(emoji => {
    const item = document.createElement('div');
    item.className = 'picker-item';
    item.textContent = emoji;
    item.addEventListener('click', () => {
      insertAtCursor(emoji);
      document.getElementById('emojiPicker').classList.remove('active');
    });
    grid.appendChild(item);
  });
}

function initUnicodePicker() {
  const grid = document.getElementById('unicodeGrid');
  grid.innerHTML = '';
  
  UNICODE_CHARS.forEach(char => {
    const item = document.createElement('div');
    item.className = 'picker-item';
    item.textContent = char;
    item.addEventListener('click', () => {
      insertAtCursor(char);
      document.getElementById('unicodePicker').classList.remove('active');
    });
    grid.appendChild(item);
  });
}

function initColorPalette() {
  const grid = document.getElementById('colorPaletteGrid');
  grid.innerHTML = '';
  
  Object.entries(MATERIAL_COLORS).forEach(([name, shades]) => {
    shades.forEach((color, index) => {
      const item = document.createElement('div');
      item.className = 'color-palette-item';
      
      const swatch = document.createElement('div');
      swatch.className = 'color-palette-swatch';
      swatch.style.backgroundColor = color;
      
      const label = document.createElement('div');
      label.className = 'color-palette-label';
      label.textContent = color;
      
      item.appendChild(swatch);
      item.appendChild(label);
      
      item.addEventListener('click', () => {
        applyColorToSelection(color);
        document.getElementById('colorPalettePanel').classList.remove('active');
      });
      
      grid.appendChild(item);
    });
  });
}

// Wrap all event listeners in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {

// Event Listeners
document.getElementById('fontSizeInc').addEventListener('click', () => {
  settings.fontSize = Math.min(settings.fontSize + 1, 100);
  document.getElementById('fontSizeDisplay').textContent = settings.fontSize;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('fontSizeDec').addEventListener('click', () => {
  settings.fontSize = Math.max(settings.fontSize - 1, 8);
  document.getElementById('fontSizeDisplay').textContent = settings.fontSize;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('lineHeightInc').addEventListener('click', () => {
  settings.lineHeight = Math.min(parseFloat((settings.lineHeight + 0.1).toFixed(1)), 3);
  document.getElementById('lineHeightDisplay').textContent = settings.lineHeight;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('lineHeightDec').addEventListener('click', () => {
  settings.lineHeight = Math.max(parseFloat((settings.lineHeight - 0.1).toFixed(1)), 1);
  document.getElementById('lineHeightDisplay').textContent = settings.lineHeight;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('textColor').addEventListener('input', (e) => {
  settings.textColor = e.target.value;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('bgColor').addEventListener('input', (e) => {
  settings.bgColor = e.target.value;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('bgOpacity').addEventListener('input', (e) => {
  settings.bgOpacity = parseInt(e.target.value);
  document.getElementById('bgOpacityValue').textContent = settings.bgOpacity + '%';
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('fillBg').addEventListener('change', (e) => {
  settings.fillBg = e.target.checked;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('showBorder').addEventListener('change', (e) => {
  settings.showBorder = e.target.checked;
  saveSettings();
});

document.getElementById('borderColor').addEventListener('input', (e) => {
  settings.borderColor = e.target.value;
  saveSettings();
});

document.getElementById('borderWidthInc').addEventListener('click', () => {
  settings.borderWidth = Math.min(settings.borderWidth + 1, 20);
  document.getElementById('borderWidthDisplay').textContent = settings.borderWidth;
  saveSettings();
});

document.getElementById('borderWidthDec').addEventListener('click', () => {
  settings.borderWidth = Math.max(settings.borderWidth - 1, 1);
  document.getElementById('borderWidthDisplay').textContent = settings.borderWidth;
  saveSettings();
});

document.getElementById('paddingInc').addEventListener('click', () => {
  settings.padding = Math.min(settings.padding + 5, 100);
  document.getElementById('paddingDisplay').textContent = settings.padding;
  saveSettings();
});

document.getElementById('paddingDec').addEventListener('click', () => {
  settings.padding = Math.max(settings.padding - 5, 0);
  document.getElementById('paddingDisplay').textContent = settings.padding;
  saveSettings();
});

document.getElementById('wrapText').addEventListener('change', (e) => {
  settings.wrapText = e.target.checked;
  saveSettings();
  updateWrapControlState();
  updateTextareaStyle();
});

document.getElementById('maxWidth').addEventListener('input', (e) => {
  settings.maxWidth = parseInt(e.target.value);
  document.getElementById('maxWidthValue').textContent = settings.maxWidth + 'px';
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('rtlMode').addEventListener('change', (e) => {
  settings.rtlMode = e.target.checked;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('autoPaste').addEventListener('change', (e) => {
  settings.autoPaste = e.target.checked;
  saveSettings();
});

document.getElementById('borderRadius').addEventListener('change', (e) => {
  settings.borderRadius = e.target.checked;
  saveSettings();
});

document.getElementById('boldBtn').addEventListener('click', () => {
  document.execCommand('bold', false, null);
});

document.getElementById('italicBtn').addEventListener('click', () => {
  document.execCommand('italic', false, null);
});

document.getElementById('underlineBtn').addEventListener('click', () => {
  document.execCommand('underline', false, null);
});

document.getElementById('textInput').addEventListener('input', () => {
  const editor = document.getElementById('textInput');
  settings.savedText = editor.innerHTML;
  saveSettings();
});

document.getElementById('recycleBtn').addEventListener('click', () => {
  const editor = document.getElementById('textInput');
  editor.innerHTML = '';
  settings.savedText = '';
  saveSettings();
  showToast('Text cleared!', 'success');
});

document.getElementById('emojiBtn').addEventListener('click', () => {
  saveSelection();
  document.getElementById('emojiPicker').classList.add('active');
});

document.getElementById('unicodeBtn').addEventListener('click', () => {
  saveSelection();
  document.getElementById('unicodePicker').classList.add('active');
});

document.getElementById('colorPaletteBtn').addEventListener('click', () => {
  saveSelection();
  document.getElementById('colorPalettePanel').classList.add('active');
});

document.getElementById('customColorPicker').addEventListener('input', (e) => {
  applyColorToSelection(e.target.value);
});

document.getElementById('resetColorBtn').addEventListener('click', () => {
  applyColorToSelection('#000000');
  document.getElementById('customColorPicker').value = '#000000';
});

document.getElementById('closeColorPalette').addEventListener('click', () => {
  document.getElementById('colorPalettePanel').classList.remove('active');
});

document.getElementById('colorPalettePanel').addEventListener('click', (e) => {
  if (e.target.id === 'colorPalettePanel') {
    document.getElementById('colorPalettePanel').classList.remove('active');
  }
});

document.getElementById('previewBtn').addEventListener('click', () => {
  const canvas = generateImage();
  if (!canvas) {
    showToast('Please enter some text!', 'error');
    return;
  }
  
  const previewImg = document.getElementById('previewImage');
  previewImg.src = canvas.toDataURL('image/png');
  document.getElementById('previewModal').classList.add('active');
});

document.getElementById('closePreview').addEventListener('click', () => {
  document.getElementById('previewModal').classList.remove('active');
});

document.getElementById('previewModal').addEventListener('click', (e) => {
  if (e.target.id === 'previewModal') {
    document.getElementById('previewModal').classList.remove('active');
  }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const canvas = generateImage();
  if (!canvas) {
    showToast('Please enter some text!', 'error');
    return;
  }
  
  try {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rtl-text-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Image downloaded!', 'success');
    }, 'image/png');
  } catch (err) {
    console.error('❌ Error:', err);
    showToast('Error: ' + err.message, 'error');
  }
});

document.getElementById('closeEmojiPicker').addEventListener('click', () => {
  document.getElementById('emojiPicker').classList.remove('active');
});

document.getElementById('closeUnicodePicker').addEventListener('click', () => {
  document.getElementById('unicodePicker').classList.remove('active');
});

document.getElementById('emojiPicker').addEventListener('click', (e) => {
  if (e.target.id === 'emojiPicker') {
    document.getElementById('emojiPicker').classList.remove('active');
  }
});

document.getElementById('unicodePicker').addEventListener('click', (e) => {
  if (e.target.id === 'unicodePicker') {
    document.getElementById('unicodePicker').classList.remove('active');
  }
});

document.getElementById('insertBtn').addEventListener('click', async () => {
  const editor = document.getElementById('textInput');
  const segments = getTextSegments(editor);
  
  if (segments.length === 0 || segments.every(s => !s.text.trim())) {
    showToast('Please enter some text!', 'error');
    return;
  }
  
  const canvas = generateImage();
  if (!canvas) return;
  
  try {
    canvas.toBlob(async (blob) => {
      try {
        // Copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        
        console.log('✅ Image copied to clipboard');
        showToast('Image copied! Switching to page...', 'success');
        
        // Wait a moment for clipboard
        await new Promise(resolve => setTimeout(resolve, 150));
        
		// Send message to background script with autoPaste setting
			browser.runtime.sendMessage({ 
			  action: 'triggerPaste',
			  autoPaste: settings.autoPaste 
			}, (response) => {
			  console.log('📡 Response from background:', response);
          
          // Close popup after showing notification on page
          setTimeout(() => {
            window.close();
          }, 800);
        });
        
      } catch (err) {
        console.error('❌ Clipboard error:', err);
        showToast('Error: ' + err.message, 'error');
      }
    }, 'image/png');
  } catch (err) {
    console.error('❌ Error:', err);
    showToast('Error: ' + err.message, 'error');
  }
});


document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('insertBtn').click();
  } else if (e.key === 'Escape') {
    document.getElementById('previewModal').classList.remove('active');
    document.getElementById('emojiPicker').classList.remove('active');
    document.getElementById('unicodePicker').classList.remove('active');
    document.getElementById('colorPalettePanel').classList.remove('active');
  }
});

// Initialize everything
loadSettings();
initQuickEmojis();
initEmojiPicker();
initUnicodePicker();
initColorPalette();

}); // End of DOMContentLoaded