from PIL import Image, ImageSequence
import os
import sys

def optimize_animation(input_path, output_path, colors=128, quality=80, scale=0.5, skip_frames=1):
    print(f"Opening {input_path}...")
    with Image.open(input_path) as im:
        # Get duration for the first frame if available
        duration = im.info.get('duration', 100)
        loop = im.info.get('loop', 0)
        
        frames = []
        is_webp = output_path.lower().endswith('.webp')
        
        for i, frame in enumerate(ImageSequence.Iterator(im)):
            # Skip frames if requested (e.g., skip_frames=2 means take every 2nd frame)
            if i % skip_frames != 0:
                continue
                
            # Resize frame
            if scale != 1.0:
                new_size = (int(frame.width * scale), int(frame.height * scale))
                frame = frame.resize(new_size, Image.ANTIALIAS if hasattr(Image, 'ANTIALIAS') else 1)

            if is_webp:
                # WebP handles RGB better
                frame = frame.convert('RGB')
            else:
                # GIF palette reduction
                method = getattr(Image, 'MAXCOVERAGE', 3) 
                frame = frame.convert('RGB').quantize(colors=colors, method=method)
            frames.append(frame.copy())
        
        if is_webp:
            print(f"Saving optimized WebP to {output_path} with quality={quality}...")
            # WebP requires RGBA background if color is specified
            bg_color = (0, 0, 0, 255) # Use RGBA black as default
                
            frames[0].save(
                output_path,
                save_all=True,
                append_images=frames[1:],
                optimize=True,
                duration=duration,
                loop=loop,
                quality=quality,
                method=6,
                background=bg_color
            )
        else:
            print(f"Saving optimized GIF to {output_path} with {colors} colors...")
            frames[0].save(
                output_path,
                save_all=True,
                append_images=frames[1:],
                optimize=True,
                duration=duration,
                loop=loop
            )
    
    input_size = os.path.getsize(input_path)
    output_size = os.path.getsize(output_path)
    reduction = (input_size - output_size) / input_size * 100
    print(f"Input size: {input_size / 1024 / 1024:.2f} MB")
    print(f"Output size: {output_size / 1024 / 1024:.2f} MB")
    print(f"Reduction: {reduction:.2f}%")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 optimize_gif.py <input.gif> <output.webp/gif> [colors/quality] [scale] [skip_frames]")
        print("Example: python3 optimize_gif.py input.gif output.gif 64 0.5 2")
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        param = int(sys.argv[3]) if len(sys.argv) > 3 else 128
        scale = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
        skip_frames = int(sys.argv[5]) if len(sys.argv) > 5 else 1
        
        optimize_animation(
            input_file, 
            output_file, 
            colors=param, 
            quality=param if output_file.endswith('.webp') else 80,
            scale=scale,
            skip_frames=skip_frames
        )
