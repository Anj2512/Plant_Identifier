import os, shutil, random
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

def split_dataset(raw_dir, output_dir, split=0.8):
    species_list = os.listdir(raw_dir)
    
    for species in species_list:
        species_path = os.path.join(raw_dir, species)
        
        if not os.path.isdir(species_path):
            continue

        images = [f for f in os.listdir(species_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        print(f'{species}: {len(images)} images found')

        if len(images) == 0:
            print(f'  WARNING: no images found, skipping {species}')
            continue

        random.shuffle(images)
        split_idx = int(len(images) * split)
        train_imgs = images[:split_idx]
        val_imgs = images[split_idx:]

        for split_name, split_imgs in [('train', train_imgs), ('val', val_imgs)]:
            out_path = os.path.join(output_dir, split_name, species)
            os.makedirs(out_path, exist_ok=True)
            for img in split_imgs:
                shutil.copy(os.path.join(species_path, img), os.path.join(out_path, img))

        print(f'  Train: {len(train_imgs)}, Val: {len(val_imgs)}')

    print('\nDone! Checking output:')
    for split_name in ['train', 'val']:
        split_path = os.path.join(output_dir, split_name)
        if os.path.exists(split_path):
            print(f'  {split_name}/: {os.listdir(split_path)}')
        else:
            print(f'  {split_name}/: NOT CREATED')

split_dataset(
    'training/dataset/raw',
    'training/dataset'
)