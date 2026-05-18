import google.generativeai as genai
import os
import json
import re

# This file contains the core logic to connect to Gemini 1.5 Flash
# You must set GEMINI_API_KEY as an environment variable or pass it directly.

def analyze_invoice_with_gemini(file_bytes: bytes, mime_type: str, api_key: str = None) -> dict:
    key = api_key or os.environ.get("GEMINI_API_KEY")
    if not key:
        return {
            "status": "Mock Mode",
            "summary": "Mock: Please set GEMINI_API_KEY to use AI analysis.",
            "loopholes": ["Mock: HSN Code missing", "Mock: Tax mismatch"],
            "errors": ["Mock: Invalid GSTIN"],
            "risk_level": "High"
        }

    genai.configure(api_key=key)
    
    # Use Gemini 1.5 Flash for fast multimodal processing
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = """
    You are an expert Indian Chartered Accountant specializing in GST compliance.
    Analyze the attached invoice document very carefully.
    Identify any structural errors, calculation mismatches, missing mandatory GST fields (like HSN, proper GSTIN format), or potential compliance loopholes.
    
    Return your analysis strictly in the following JSON format without any markdown blocks or extra text:
    {
        "status": "Analyzed",
        "summary": "A brief 2 sentence summary of the invoice and its overall compliance.",
        "loopholes": ["List of potential loopholes or warnings", "Warning 2"],
        "errors": ["List of strict compliance errors", "Error 2"],
        "risk_level": "High/Medium/Low"
    }
    """
    
    try:
        response = model.generate_content([
            {'mime_type': mime_type, 'data': file_bytes},
            prompt
        ])
        
        text = response.text
        text = re.sub(r'```json\n|\n```', '', text).strip()
        
        return json.loads(text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "status": "Error",
            "summary": f"Failed to analyze with Gemini: {str(e)}",
            "loopholes": [],
            "errors": [],
            "risk_level": "Unknown"
        }
