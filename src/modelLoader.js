import * as tf from '@tensorflow/tfjs';

export async function loadModel() {
  const model = await tf.loadLayersModel('/tfjs_model_dir/model.json');
  console.log('✅ Model loaded');
  return model;
}
