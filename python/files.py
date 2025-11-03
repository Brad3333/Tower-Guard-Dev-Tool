import os

#folder_path = "C:/Users/bdaus/TG Reports"

def get_sheets(folder_path: str):
    files: list[str] = []

    for filename in os.listdir(folder_path):
        if filename.endswith(".xlsx"):
            full_path = os.path.join(folder_path, filename)
            files.append(full_path) 
            
    return files
        
