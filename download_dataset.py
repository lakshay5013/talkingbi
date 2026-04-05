import kagglehub
import os

print("Downloading dataset...")
# Download latest version
path = kagglehub.dataset_download("ishika9bhatia/power-bi-sales-dashboard-online-sales-analysis")

print("Path to dataset files:", path)

# Copy the CSV file to the current directory for easier access
import shutil
for file in os.listdir(path):
    if file.endswith('.csv'):
        source_file = os.path.join(path, file)
        target_file = os.path.join(os.getcwd(), file)
        shutil.copy2(source_file, target_file)
        print(f"Copied {file} to {target_file}")
