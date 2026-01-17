# Background Images

Folder untuk menyimpan background images yang dipakai di scene.

## Format Image yang Support

### 1. **2D Texture** (`type: "texture"`)
- **Format**: JPG, PNG, WebP, GIF
- **Recommended Size**: 1920x1080 atau 2048x2048
- **Use Case**: Simple background image, seperti sky, gradient, atau pattern

### 2. **Skybox** (`type: "skybox"`)
- **Format**: JPG atau PNG (6 files)
- **Files**: px.jpg, nx.jpg, py.jpg, ny.jpg, pz.jpg, nz.jpg
  - `px` = positive X (right)
  - `nx` = negative X (left)
  - `py` = positive Y (top)
  - `ny` = negative Y (bottom)
  - `pz` = positive Z (front)
  - `nz` = negative Z (back)
- **Recommended Size**: 512x512 atau 1024x1024 per face
- **Use Case**: Realistic environment, game backgrounds

### 3. **Equirectangular/HDRI** (`type: "equirectangular"`)
- **Format**: HDR, EXR, JPG (panorama 360°)
- **Aspect Ratio**: 2:1 (contoh: 4096x2048)
- **Use Case**: Realistic lighting, reflections, photo-realistic scenes

## Free Resources

### 2D Textures & Skybox
- [Poly Haven](https://polyhaven.com/hdris) - Free HDRIs and textures
- [HDRI Haven](https://hdrihaven.com/) - Free 360° HDRIs
- [Textures.com](https://www.textures.com/) - Free & paid textures

### Skybox Generator
- [Skybox AI](https://skybox.blockadelabs.com/) - AI-generated skyboxes
- [Humus](http://www.humus.name/index.php?page=Textures) - Free cube maps

## Example Structure

```
public/
└── backgrounds/
    ├── sky.jpg                  # Simple 2D background
    ├── gradient.png             # Gradient background
    ├── skybox/
    │   ├── px.jpg              # Right
    │   ├── nx.jpg              # Left
    │   ├── py.jpg              # Top
    │   ├── ny.jpg              # Bottom
    │   ├── pz.jpg              # Front
    │   └── nz.jpg              # Back
    └── hdri/
        ├── sunset.hdr          # HDR panorama
        └── studio.exr          # EXR environment
```

## Tips

1. **Optimize File Size**
   - Compress images dengan tools seperti [TinyPNG](https://tinypng.com/)
   - Gunakan WebP untuk better compression

2. **Resolution Guidelines**
   - 2D Texture: 1920x1080 (Full HD) cukup
   - Skybox: 1024x1024 per face untuk web
   - HDRI: 2048x1024 untuk balance quality vs performance

3. **Performance**
   - Avoid using 4K+ images kalau gak perlu
   - HDR files bisa besar, compress kalau bisa
   - Preload images kalau mau avoid loading delay
