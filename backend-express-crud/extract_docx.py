import zipfile
import xml.etree.ElementTree as ET
import os

def extract_docx_text(docx_path):
    namespaces = {
        'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    }
    
    if not os.path.exists(docx_path):
        return f"Error: {docx_path} does not exist."
        
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            paragraphs = []
            # Traverse children of body to preserve order of paragraphs, tables, etc.
            # But simple traversal of all paragraphs in order is usually fine
            for p in root.findall('.//w:p', namespaces):
                p_text = []
                for t in p.findall('.//w:t', namespaces):
                    if t.text:
                        p_text.append(t.text)
                paragraphs.append("".join(p_text))
                
            return "\n".join(paragraphs)
    except Exception as e:
        return f"Error parsing docx: {str(e)}"

if __name__ == '__main__':
    docx_file = 'Modul_ExpressJS_CRUD.docx'
    output_file = 'Modul_ExpressJS_CRUD.txt'
    
    text = extract_docx_text(docx_file)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Done! Extracted text from {docx_file} to {output_file}")
