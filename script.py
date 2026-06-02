import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array, save_img
import numpy as np

def augment_dataset(input_dir, output_dir, target_count=50):
    print(f'Looking in: {os.path.abspath(input_dir)}')
    print(f'Contents: {os.listdir(input_dir)}')
    datagen = ImageDataGenerator(
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        vertical_flip=False,
        zoom_range=0.3,
        shear_range=0.1,
        brightness_range=[0.7, 1.3],
        fill_mode='nearest'
    )

    for species in os.listdir(input_dir):
        species_path = os.path.join(input_dir, species)
        if not os.path.isdir(species_path):
            continue

        print(f'Processing species: {species}')

        out_path = os.path.join(output_dir, species)
        os.makedirs(out_path, exist_ok=True)

        # fix: .lower() handles .JPG, .JPEG, .PNG etc.
        images = [f for f in os.listdir(species_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        print(f'  Found {len(images)} images in {species_path}')

        if len(images) == 0:
            print(f'  WARNING: no images found, skipping {species}')
            continue

        generated = 0
        while generated < target_count:
            for img_file in images:
                if generated >= target_count:
                    break
                try:
                    img = load_img(os.path.join(species_path, img_file), target_size=(224, 224))
                    x = img_to_array(img)
                    x = np.expand_dims(x, axis=0)

                    for batch in datagen.flow(x, batch_size=1):
                        save_img(os.path.join(out_path, f'aug_{generated}.jpg'), batch[0])
                        generated += 1
                        break
                except Exception as e:
                    print(f'  ERROR on {img_file}: {e}')

        print(f'  Done: {generated} augmented images saved')

augment_dataset('training/dataset/raw', 'training/dataset/supplemented')