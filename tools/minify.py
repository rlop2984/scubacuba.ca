#!/usr/bin/env python3
"""Regenerate minified CSS + JS bundles. Run this any time you edit
prototype/css/styles.css, prototype/js/i18n.js or prototype/js/main.js.

Usage:
    python3 tools/minify.py
"""
import re, pathlib, os, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / 'prototype'

def minify_css(text):
    text = re.sub(r'/\*[\s\S]*?\*/', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\s*([{};:,>+~])\s*', r'\1', text)
    text = re.sub(r';}', '}', text)
    return text.strip()

def minify_js(text):
    text = re.sub(r'/\*[\s\S]*?\*/', '', text)
    lines = []
    for line in text.split('\n'):
        stripped = line.strip()
        if stripped.startswith('//'): continue
        m = re.search(r'(\s+)//[^"\'`]*$', line)
        if m and 'http' not in line.split('//', 1)[1]:
            line = line[:m.start()]
        lines.append(line)
    text = '\n'.join(lines)
    text = re.sub(r'\n\s*\n+', '\n', text)
    text = re.sub(r'[ \t]+$', '', text, flags=re.MULTILINE)
    return text.strip()

targets = [
    (ROOT / 'css' / 'styles.css', ROOT / 'css' / 'styles.min.css', minify_css),
    (ROOT / 'js' / 'i18n.js',     ROOT / 'js' / 'i18n.min.js',     minify_js),
    (ROOT / 'js' / 'main.js',     ROOT / 'js' / 'main.min.js',     minify_js),
]
for src, dst, fn in targets:
    if not src.exists():
        print(f'  skip (missing): {src}', file=sys.stderr); continue
    text = src.read_text()
    mini = fn(text)
    dst.write_text(mini)
    so, sn = src.stat().st_size, dst.stat().st_size
    print(f'  {src.name:20} -> {dst.name:25}  {so//1024}KB -> {sn//1024}KB ({100*(so-sn)//so}% smaller)')
print('done.')
