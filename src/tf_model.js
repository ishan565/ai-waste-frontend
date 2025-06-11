import * as tf from '@tensorflow/tfjs';

let model = null;

export const loadModel = async () => {
    if (!model) {
        model = await tf.loadLayersModel('/model/model.json');
        console.log('✅ Model loaded');
    }
    return model;
};

export const classifyImageTensor = async (imageElement) => {
    if (!model) {
        await loadModel();
    }

    // Preprocess the image
    const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224]) // Adjust if your model uses a different size
        .toFloat()
        .div(tf.scalar(255.0)) // Normalize
        .expandDims();

    const prediction = await model.predict(tensor).data();
    const predictedIndex = prediction.indexOf(Math.max(...prediction));
    
    // Dummy label map – replace with your actual categories
    const labels = ['Plastic', 'Organic', 'Metal', 'Paper'];
    return {
        category: labels[predictedIndex],
        confidence: prediction[predictedIndex]
    };
};
