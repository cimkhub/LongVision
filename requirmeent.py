import subprocess

# Generate a requirements.txt file
with open("requirements.txt", "w") as f:
    subprocess.run(["pip", "freeze"], stdout=f)

print("requirements.txt file created successfully.")