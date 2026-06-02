import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing import image_dataset_from_directory
import os

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# paths
TRAIN_DIR = 'training/dataset/train'
VAL_DIR = 'training/dataset/val'
MODEL_SAVE_PATH = 'backend/model/plant_model.keras'
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 20

# load datasets
print('Loading datasets...')
train_ds = image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True
)

val_ds = image_dataset_from_directory(
    VAL_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

# save class names before batching
class_names = train_ds.class_names
print(f'Classes found: {class_names}')

# normalize pixel values to 0-1
normalization_layer = layers.Rescaling(1./255)
train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))

# performance optimization
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

# load MobileNetV2 with pretrained weights, without the top layer
print('Loading MobileNetV2 base model...')
base_model = MobileNetV2(input_shape=IMG_SIZE + (3,), include_top=False, weights='imagenet')
base_model.trainable = False  # freeze base model layers

# build the full model
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(len(class_names), activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# train
print('Training...')
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS
)

# save the model
os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
model.save(MODEL_SAVE_PATH)
print(f'Model saved to {MODEL_SAVE_PATH}')

# save class names so the backend knows what each output means
with open('backend/model/class_names.txt', 'w') as f:
    for name in class_names:
        f.write(name + '\n')
print('Class names saved to backend/model/class_names.txt')