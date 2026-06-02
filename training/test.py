import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np

# load model and class names
model = tf.keras.models.load_model('backend/model/plant_model.keras')
with open('backend/model/class_names.txt', 'r') as f:
    class_names = [line.strip() for line in f.readlines()]

def predict_plant(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = x / 255.0
    x = np.expand_dims(x, axis=0)

    predictions = model.predict(x)
    top_3 = np.argsort(predictions[0])[::-1][:3]

    print(f'\nResults for: {img_path}')
    for i in top_3:
        print(f'  {class_names[i]}: {predictions[0][i]*100:.1f}%')

predict_plant('training/test_images/newlilytest_img.jpg')