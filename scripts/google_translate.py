#!/usr/bin/env python3
"""
Google Translate script for legal document translation
Uses the googletrans library to translate text to various Indian languages
"""

import sys
import json
import argparse
from googletrans import Translator
import time

def translate_text(text, target_language, source_language='auto'):
    """
    Translate text using Google Translate
    
    Args:
        text (str): Text to translate
        target_language (str): Target language code (e.g., 'hi', 'ta', 'te')
        source_language (str): Source language code (default: 'auto')
    
    Returns:
        dict: Translation result with original and translated text
    """
    try:
        translator = Translator()
        
        # Split large text into chunks to avoid API limits
        max_chunk_size = 4500  # Google Translate has ~5000 char limit
        chunks = []
        
        if len(text) > max_chunk_size:
            # Split by sentences to maintain context
            sentences = text.split('. ')
            current_chunk = ""
            
            for sentence in sentences:
                if len(current_chunk + sentence + '. ') <= max_chunk_size:
                    current_chunk += sentence + '. '
                else:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    current_chunk = sentence + '. '
            
            if current_chunk:
                chunks.append(current_chunk.strip())
        else:
            chunks = [text]
        
        translated_chunks = []
        
        for i, chunk in enumerate(chunks):
            try:
                # Add small delay between requests to avoid rate limiting
                if i > 0:
                    time.sleep(0.1)
                
                result = translator.translate(chunk, dest=target_language, src=source_language)
                translated_chunks.append(result.text)
                
                print(f"[v0] Translated chunk {i+1}/{len(chunks)}", file=sys.stderr)
                
            except Exception as chunk_error:
                print(f"[v0] Error translating chunk {i+1}: {str(chunk_error)}", file=sys.stderr)
                # Use original text if translation fails
                translated_chunks.append(chunk)
        
        translated_text = ' '.join(translated_chunks)
        
        return {
            'success': True,
            'originalText': text,
            'translatedText': translated_text,
            'sourceLanguage': source_language,
            'targetLanguage': target_language,
            'chunksProcessed': len(chunks)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'originalText': text,
            'translatedText': text,  # Fallback to original
            'sourceLanguage': source_language,
            'targetLanguage': target_language
        }

def main():
    parser = argparse.ArgumentParser(description='Translate text using Google Translate')
    parser.add_argument('--text', required=True, help='Text to translate')
    parser.add_argument('--target', required=True, help='Target language code')
    parser.add_argument('--source', default='auto', help='Source language code')
    parser.add_argument('--output', choices=['json', 'text'], default='json', help='Output format')
    
    args = parser.parse_args()
    
    result = translate_text(args.text, args.target, args.source)
    
    if args.output == 'json':
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        if result['success']:
            print(result['translatedText'])
        else:
            print(f"Error: {result['error']}", file=sys.stderr)
            print(result['originalText'])

if __name__ == '__main__':
    main()
