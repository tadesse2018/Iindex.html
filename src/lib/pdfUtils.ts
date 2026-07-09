// Robust utilities to clean oklch/oklab CSS variables and colors during PDF generation
// This prevents html2canvas and html2pdf.js from crashing with:
// "Attempting to parse an unsupported color function 'oklch'"

// Helper to convert oklch string to rgb/rgba using robust component extraction
export const oklchToRgb = (oklchStr: string): string | null => {
  try {
    const innerMatch = oklchStr.match(/oklch\(([^)]+)\)/i);
    if (!innerMatch) return null;
    
    const parts = innerMatch[1].match(/[-\d\.]+%?|none/gi);
    if (!parts || parts.length < 3) return null;
    
    const parsePart = (str: string, isPercent = false) => {
      if (str.toLowerCase() === 'none') return 0;
      if (str.endsWith('%')) return parseFloat(str) / 100;
      const val = parseFloat(str);
      return isPercent ? val / 100 : val;
    };

    const L = parsePart(parts[0]);
    const C = parsePart(parts[1]);
    const H = parsePart(parts[2]);
    const A = parts[3] ? parsePart(parts[3], parts[3].endsWith('%')) : 1;

    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    const l_val = L + 0.3963377774 * a + 0.2158037573 * b;
    const m = L - 0.1055613458 * a - 0.0638541728 * b;
    const s = L - 0.0894841775 * a - 1.2914855480 * b;

    const l_ = l_val * l_val * l_val;
    const m_ = m * m * m;
    const s_ = s * s * s;

    let r = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    let g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    let b_val = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

    const gamma = (c: number) => {
      if (c <= 0.0031308) return 12.92 * c;
      return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    };

    let r_s = Math.max(0, Math.min(1, gamma(r))) * 255;
    let g_s = Math.max(0, Math.min(1, gamma(g))) * 255;
    let b_s = Math.max(0, Math.min(1, gamma(b_val))) * 255;

    r_s = Math.round(r_s);
    g_s = Math.round(g_s);
    b_s = Math.round(b_s);

    if (A === 1) {
      return `rgb(${r_s}, ${g_s}, ${b_s})`;
    } else {
      return `rgba(${r_s}, ${g_s}, ${b_s}, ${A})`;
    }
  } catch (e) {
    return null;
  }
};

// Helper to convert oklab string to rgb/rgba using robust component extraction
export const oklabToRgb = (oklabStr: string): string | null => {
  try {
    const innerMatch = oklabStr.match(/oklab\(([^)]+)\)/i);
    if (!innerMatch) return null;
    
    const parts = innerMatch[1].match(/[-\d\.]+%?|none/gi);
    if (!parts || parts.length < 3) return null;
    
    const parsePart = (str: string, isPercent = false) => {
      if (str.toLowerCase() === 'none') return 0;
      if (str.endsWith('%')) return parseFloat(str) / 100;
      const val = parseFloat(str);
      return isPercent ? val / 100 : val;
    };

    const L = parsePart(parts[0]);
    const a = parsePart(parts[1]);
    const b = parsePart(parts[2]);
    const A = parts[3] ? parsePart(parts[3], parts[3].endsWith('%')) : 1;

    const l_val = L + 0.3963377774 * a + 0.2158037573 * b;
    const m = L - 0.1055613458 * a - 0.0638541728 * b;
    const s = L - 0.0894841775 * a - 1.2914855480 * b;

    const l_ = l_val * l_val * l_val;
    const m_ = m * m * m;
    const s_ = s * s * s;

    let r = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    let g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    let b_val = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

    const gamma = (c: number) => {
      if (c <= 0.0031308) return 12.92 * c;
      return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    };

    let r_s = Math.max(0, Math.min(1, gamma(r))) * 255;
    let g_s = Math.max(0, Math.min(1, gamma(g))) * 255;
    let b_s = Math.max(0, Math.min(1, gamma(b_val))) * 255;

    r_s = Math.round(r_s);
    g_s = Math.round(g_s);
    b_s = Math.round(b_s);

    if (A === 1) {
      return `rgb(${r_s}, ${g_s}, ${b_s})`;
    } else {
      return `rgba(${r_s}, ${g_s}, ${b_s}, ${A})`;
    }
  } catch (e) {
    return null;
  }
};

export const safeOklchFallback = (oklchStr: string): string => {
  const converted = oklchToRgb(oklchStr);
  if (converted) return converted;
  try {
    const matchL = oklchStr.match(/oklch\(\s*([-\d\.]+%?)/i);
    if (matchL) {
      const L = matchL[1].endsWith('%') ? parseFloat(matchL[1]) / 100 : parseFloat(matchL[1]);
      return L > 0.6 ? 'rgb(245, 245, 244)' : 'rgb(28, 25, 23)';
    }
  } catch (e) {}
  return 'rgb(255, 255, 255)';
};

export const safeOklabFallback = (oklabStr: string): string => {
  const converted = oklabToRgb(oklabStr);
  if (converted) return converted;
  try {
    const matchL = oklabStr.match(/oklab\(\s*([-\d\.]+%?)/i);
    if (matchL) {
      const L = matchL[1].endsWith('%') ? parseFloat(matchL[1]) / 100 : parseFloat(matchL[1]);
      return L > 0.6 ? 'rgb(245, 245, 244)' : 'rgb(28, 25, 23)';
    }
  } catch (e) {}
  return 'rgb(255, 255, 255)';
};

export const colorProps = [
  'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 
  'borderBottomColor', 'borderLeftColor', 'outlineColor', 'fill', 'stroke'
];

export const replaceColors = (val: any): any => {
  if (typeof val === 'string') {
    if (val.includes('oklch(')) {
      val = val.replace(/oklch\([^)]+\)/gi, (m) => safeOklchFallback(m));
    }
    if (val.includes('oklab(')) {
      val = val.replace(/oklab\([^)]+\)/gi, (m) => safeOklabFallback(m));
    }
  }
  return val;
};

// Clean all document styleSheets rules in-place to prevent html2canvas failures
export const cleanStyleSheets = (doc: Document) => {
  const cssRulesToRestore: { rule: CSSStyleRule; originalCssText: string }[] = [];
  
  const processRules = (rules: CSSRuleList) => {
    try {
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        if (rule instanceof CSSStyleRule && rule.style) {
          const text = rule.style.cssText;
          if (text && (text.includes('oklch') || text.includes('oklab'))) {
            cssRulesToRestore.push({ rule, originalCssText: text });
            let newText = text.replace(/oklch\([^)]+\)/gi, (m) => safeOklchFallback(m));
            newText = newText.replace(/oklab\([^)]+\)/gi, (m) => safeOklabFallback(m));
            rule.style.cssText = newText;
          }
        } else if ((rule as any).cssRules) {
          // Recursively clean group rules like @media, @supports, etc.
          processRules((rule as any).cssRules);
        }
      }
    } catch (e) {
      // Ignore individual rule errors
    }
  };

  try {
    for (let i = 0; i < doc.styleSheets.length; i++) {
      const sheet = doc.styleSheets[i];
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          processRules(rules);
        }
      } catch (e) {
        // Ignore cross-origin stylesheet errors
      }
    }
  } catch (e) {}

  return () => {
    cssRulesToRestore.forEach(({ rule, originalCssText }) => {
      try {
        rule.style.cssText = originalCssText;
      } catch (e) {}
    });
  };
};

// Clean all document style elements in-place to prevent html2canvas cloning leaks
export const cleanStyleElements = (doc: Document) => {
  const styleTagsToRestore: { tag: HTMLStyleElement; originalText: string }[] = [];
  try {
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      const text = styleTag.textContent || '';
      if (text.includes('oklch') || text.includes('oklab')) {
        styleTagsToRestore.push({ tag: styleTag, originalText: text });
        let cssText = text.replace(/oklch\([^)]+\)/gi, (m) => safeOklchFallback(m));
        cssText = cssText.replace(/oklab\([^)]+\)/gi, (m) => safeOklabFallback(m));
        styleTag.textContent = cssText;
      }
    });
  } catch (e) {}
  return () => {
    styleTagsToRestore.forEach(({ tag, originalText }) => {
      try {
        tag.textContent = originalText;
      } catch (e) {}
    });
  };
};

// Monkey-patch CSSStyleDeclaration prototype and window.getComputedStyle on a target window context
export const patchWindow = (win: any) => {
  if (!win) return () => {};
  
  const originalGetComputedStyle = win.getComputedStyle;
  const originalGetPropertyValue = win.CSSStyleDeclaration?.prototype?.getPropertyValue;
  const originalDescriptors: Record<string, PropertyDescriptor | undefined> = {};
  
  // Override win.getComputedStyle with a Proxy for safety across all properties
  try {
    if (originalGetComputedStyle) {
      win.getComputedStyle = function (this: any, ...args: any[]) {
        const computedStyle = originalGetComputedStyle.apply(this, args);
        if (!computedStyle) return computedStyle;
        
        return new Proxy(computedStyle, {
          get(target: any, prop: string | symbol) {
            const val = target[prop];
            if (typeof prop === 'symbol') {
              return val;
            }
            if (typeof val === 'function') {
              return function (this: any, ...fnArgs: any[]) {
                const result = val.apply(target, fnArgs);
                return replaceColors(result);
              };
            }
            return replaceColors(val);
          }
        });
      };
    }
  } catch (e) {
    console.warn('Failed to patch win.getComputedStyle', e);
  }

  try {
    if (win.CSSStyleDeclaration) {
      win.CSSStyleDeclaration.prototype.getPropertyValue = function (propertyName: string) {
        const val = originalGetPropertyValue.call(this, propertyName);
        return replaceColors(val);
      };

      // Dynamically iterate and override getters of ALL properties in CSSStyleDeclaration prototype
      // This completely blocks any property (e.g. background, boxShadow) from leaking oklch/oklab
      const keys = win.Object.getOwnPropertyNames(win.CSSStyleDeclaration.prototype);
      keys.forEach((prop: string) => {
        if (prop === 'constructor' || prop === 'getPropertyValue' || prop === 'setProperty' || prop === 'removeProperty') return;
        try {
          const desc = win.Object.getOwnPropertyDescriptor(win.CSSStyleDeclaration.prototype, prop);
          if (desc && desc.configurable && (desc.get || typeof desc.value !== 'function')) {
            originalDescriptors[prop] = desc;
            win.Object.defineProperty(win.CSSStyleDeclaration.prototype, prop, {
              configurable: true,
              enumerable: desc.enumerable,
              get() {
                try {
                  const val = desc.get ? desc.get.call(this) : (originalGetPropertyValue ? originalGetPropertyValue.call(this, prop) : this.getPropertyValue(prop));
                  return replaceColors(val);
                } catch (e) {
                  return undefined;
                }
              },
              set(v: any) {
                try {
                  if (desc.set) {
                    desc.set.call(this, v);
                  } else {
                    this.setProperty(prop, v);
                  }
                } catch (e) {}
              }
            });
          }
        } catch (e) {}
      });

      // Also override cssText getter
      const descCssText = win.Object.getOwnPropertyDescriptor(win.CSSStyleDeclaration.prototype, 'cssText');
      if (descCssText && descCssText.get) {
        originalDescriptors['cssText'] = descCssText;
        win.Object.defineProperty(win.CSSStyleDeclaration.prototype, 'cssText', {
          configurable: true,
          enumerable: descCssText.enumerable,
          get() {
            const val = descCssText.get!.call(this);
            return replaceColors(val);
          },
          set: descCssText.set ? function(this: any, v: any) { descCssText.set!.call(this, v); } : undefined
        });
      }

      // Also override CSSStyleRule.prototype.cssText getter to strip oklch/oklab
      if (win.CSSStyleRule) {
        const descRuleCssText = win.Object.getOwnPropertyDescriptor(win.CSSStyleRule.prototype, 'cssText');
        if (descRuleCssText && descRuleCssText.get) {
          originalDescriptors['ruleCssText'] = descRuleCssText;
          win.Object.defineProperty(win.CSSStyleRule.prototype, 'cssText', {
            configurable: true,
            enumerable: descRuleCssText.enumerable,
            get() {
              const val = descRuleCssText.get!.call(this);
              return replaceColors(val);
            },
            set: descRuleCssText.set ? function(this: any, v: any) { descRuleCssText.set!.call(this, v); } : undefined
          });
        }
      }
    }
  } catch (e) {
    console.error('Failed to setup style monkeypatching on window', e);
  }

  return () => {
    try {
      if (originalGetComputedStyle) {
        win.getComputedStyle = originalGetComputedStyle;
      }
      if (win.CSSStyleDeclaration) {
        win.CSSStyleDeclaration.prototype.getPropertyValue = originalGetPropertyValue;
        win.Object.keys(originalDescriptors).forEach((prop: string) => {
          try {
            const desc = originalDescriptors[prop];
            if (prop === 'ruleCssText') {
              if (desc && win.CSSStyleRule) {
                win.Object.defineProperty(win.CSSStyleRule.prototype, 'cssText', desc);
              } else if (win.CSSStyleRule) {
                delete (win.CSSStyleRule.prototype as any).cssText;
              }
            } else {
              if (desc) {
                win.Object.defineProperty(win.CSSStyleDeclaration.prototype, prop, desc);
              } else {
                delete (win.CSSStyleDeclaration.prototype as any)[prop];
              }
            }
          } catch (e) {
            console.warn(`Could not restore property getter for ${prop}`, e);
          }
        });
      }
    } catch (e) {
      console.error('Failed to restore style overrides on window', e);
    }
  };
};

export interface OklchCleanupContext {
  restoreAll: () => void;
  handleClone: (clonedDoc: Document) => void;
}

export function applyOklchCleanup(doc: Document, win: any): OklchCleanupContext {
  const restoreMainStyleElements = cleanStyleElements(doc);
  const restoreMainStylesheets = cleanStyleSheets(doc);
  const restoreMainWindow = patchWindow(win);
  
  let restoreClonedWindow: (() => void) | null = null;
  let restoreClonedStylesheets: (() => void) | null = null;
  let restoreClonedStyleElements: (() => void) | null = null;

  const restoreAll = () => {
    try {
      restoreMainStyleElements();
      restoreMainStylesheets();
      restoreMainWindow();
      if (restoreClonedWindow) restoreClonedWindow();
      if (restoreClonedStylesheets) restoreClonedStylesheets();
      if (restoreClonedStyleElements) restoreClonedStyleElements();
    } catch (e) {
      console.error('Error during restoration of overrides', e);
    }
  };

  const handleClone = (clonedDoc: Document) => {
    // Ensure the cloned document is rendered in pure light mode for print/PDF ink-safety
    try {
      clonedDoc.documentElement.classList.remove('dark');
      if (clonedDoc.body) {
        clonedDoc.body.classList.remove('dark');
      }
      const darkElements = clonedDoc.querySelectorAll('.dark');
      darkElements.forEach((el) => el.classList.remove('dark'));
    } catch (e) {
      console.error('Failed to remove dark class in clone', e);
    }

    restoreClonedStyleElements = cleanStyleElements(clonedDoc);
    restoreClonedStylesheets = cleanStyleSheets(clonedDoc);
    const clonedWindow = clonedDoc.defaultView;
    if (clonedWindow) {
      restoreClonedWindow = patchWindow(clonedWindow);
    }

    // Convert inline style attributes of elements in clonedDoc
    const allElements = clonedDoc.querySelectorAll('*');
    allElements.forEach((el: any) => {
      if (el.style) {
        const styleAttr = el.getAttribute('style');
        if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
          let newStyle = styleAttr.replace(/oklch\([^)]+\)/gi, (m: string) => safeOklchFallback(m));
          newStyle = newStyle.replace(/oklab\([^)]+\)/gi, (m: string) => safeOklabFallback(m));
          el.setAttribute('style', newStyle);
        }
        
        if (el.style.cssText) {
          let cssText = el.style.cssText;
          if (cssText.includes('oklch') || cssText.includes('oklab')) {
            cssText = cssText.replace(/oklch\([^)]+\)/gi, (m: string) => safeOklchFallback(m));
            cssText = cssText.replace(/oklab\([^)]+\)/gi, (m: string) => safeOklabFallback(m));
            el.style.cssText = cssText;
          }
        }
        
        colorProps.forEach((prop: string) => {
          const val = el.style[prop];
          if (val && (val.includes('oklch') || val.includes('oklab'))) {
            let newVal = val.replace(/oklch\([^)]+\)/gi, (m: string) => safeOklchFallback(m));
            newVal = newVal.replace(/oklab\([^)]+\)/gi, (m: string) => safeOklabFallback(m));
            el.style[prop] = newVal;
          }
        });
      }
    });

    // Convert all <style> tags in cloned document
    const styleTags = clonedDoc.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      let cssText = styleTag.textContent || '';
      if (cssText.includes('oklch') || cssText.includes('oklab')) {
        cssText = cssText.replace(/oklch\([^)]+\)/gi, (m) => safeOklchFallback(m));
        cssText = cssText.replace(/oklab\([^)]+\)/gi, (m) => safeOklabFallback(m));
        styleTag.textContent = cssText;
      }
    });
  };

  return {
    restoreAll,
    handleClone
  };
}
