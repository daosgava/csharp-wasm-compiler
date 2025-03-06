# Build the project
dotnet build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "Build successful."

    # Define source and destination directories
    SOURCE_DIR="bin/Debug/net8.0/wwwroot/_framework"
    DEST_DIR="server/public/_framework"

    # Create destination directory if it doesn't exist
    mkdir -p "$DEST_DIR"

    # Copy _framework folder
    cp -r "$SOURCE_DIR"/* "$DEST_DIR"
    # copy bin/Debug/net8.0/research.dll to public/bin
    cp bin/Debug/net8.0/research.dll server/public/lib/research.dll

    echo "Copied _framework and research.dll to public folder."
else
    echo "Build failed."
fi
