// import React, { useState, useRef, useEffect } from 'react';
// import { ImageUp, Loader2, MapPin, Recycle, Search, XCircle } from 'lucide-react';
// import * as tf from '@tensorflow/tfjs';
// import { motion, AnimatePresence } from 'framer-motion';

// const fadeIn = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
// };

// const App = () => {
//     const [model, setModel] = useState(null);
//     const [selectedImage, setSelectedImage] = useState(null);
//     const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
//     const [classificationResult, setClassificationResult] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [userLocation, setUserLocation] = useState(null);
//     const [recyclingCenters, setRecyclingCenters] = useState([]);

//     const fileInputRef = useRef(null);

//     useEffect(() => {
//         tf.ready().then(() => {
//             tf.loadLayersModel('/model/model.json')
//                 .then(setModel)
//                 .catch(err => setError('Failed to load model: ' + err.message));
//         });
//     }, []);

//    useEffect(() => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setUserLocation({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         });
//       },
//       (err) => {
//         let msg = 'Unable to retrieve your location.';
//         if (err.code === err.PERMISSION_DENIED) msg = 'Location access denied.';
//         if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location unavailable.';
//         if (err.code === err.TIMEOUT) msg = 'Location request timed out.';
//         setError(msg);
//       },
//       { enableHighAccuracy: true, timeout: 5000 }
//     );
//   } else {
//     setError('Geolocation not supported by this browser.');
//   }
// }, []);

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file?.type.startsWith('image/')) {
//             setSelectedImage(file);
//             setImagePreviewUrl(URL.createObjectURL(file));
//             setClassificationResult(null);
//             setError(null);
//             setRecyclingCenters([]);
//         } else {
//             setError('Please upload a valid image file.');
//             setSelectedImage(null);
//             setImagePreviewUrl(null);
//         }
//     };

//     const classifyImage = async () => {
//         if (!selectedImage || !model) return setError('Upload image & wait for model.');

//         setIsLoading(true);
//         setError(null);

//         try {
//             const img = new Image();
//             img.src = imagePreviewUrl;
//             img.crossOrigin = 'anonymous';
//             img.onload = async () => {
//                 const tensor = tf.browser.fromPixels(img)
//                   .resizeNearestNeighbor([300, 300])
//                     .toFloat().div(tf.scalar(255.0)).expandDims();
//                 const prediction = model.predict(tensor);
//                 const predictionArray = await prediction.data();
//                 const categoryIndex = predictionArray.indexOf(Math.max(...predictionArray));

//                 const categories = ['Cardboard', 'Glass', 'Metal', 'Paper', 'Plastic', 'Trash'];
//                 const disposalTipMap = {
//   'Cardboard': "Flatten and place in the paper recycling bin. Keep it dry.",
//   'Glass': "Rinse and place in the glass recycling bin. Remove lids or caps.",
//   'Metal': "Rinse and recycle in the metal bin. Aluminum cans can be crushed to save space.",
//   'Paper': "Bundle and keep dry before placing in the paper recycling bin.",
//   'Plastic': "Check the recycling number. Rinse thoroughly and place in the plastic recycling bin.",
//   'Trash': "Dispose of in the general landfill bin. Not recyclable."
// };

//                 setClassificationResult({
//                     category: categories[categoryIndex],
//                     confidence: predictionArray[categoryIndex],
//                     disposal: disposalTipMap[categories[categoryIndex]],
//                 });

//                 setIsLoading(false);
//             };
//         } catch (err) {
//             setError('Classification failed: ' + err.message);
//             setIsLoading(false);
//         }
//     };

//     const findRecyclingCenters = async () => {
//         if (!userLocation) return setError('Location required.');
//         setIsLoading(true);
//         setError(null);
//         try {
//             const res = await fetch(`http://localhost:5001/recycling-centers?lat=${userLocation.latitude}&lon=${userLocation.longitude}`);
//             if (!res.ok) throw new Error('API error');
//             const data = await res.json();
//             setRecyclingCenters(data);
//         } catch (err) {
//             setError('Finding centers failed: ' + err.message);
//             setRecyclingCenters([]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const clearImage = () => {
//         setSelectedImage(null);
//         setImagePreviewUrl(null);
//         setClassificationResult(null);
//         setError(null);
//         setRecyclingCenters([]);
//     };

//     return (
//       <div className="w-screen h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4 font-sans text-gray-800 flex items-center justify-center">

//             <motion.div initial="hidden" animate="visible" variants={fadeIn} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-teal-300">
//                 <h1 className="text-5xl font-extrabold text-center text-teal-700 mb-5 flex items-center justify-center gap-3 animate-bounce">
//                     <Recycle className="w-10 h-10 text-green-500 animate-spin-slow" /> Eco-Sort AI 🍃🚮
//                 </h1>

//                 <div className="mb-6 border-2 border-dashed border-teal-400 rounded-xl p-6 text-center hover:bg-teal-100 transition">
//                     <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
//                     <button onClick={() => fileInputRef.current.click()} className="w-full py-3 px-6 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2">
//                         <ImageUp className="w-5 h-5" /> Upload Image
//                     </button>
//                     <p className="text-xs text-gray-500 mt-2">Accepted: JPG, PNG, GIF</p>
//                 </div>

//                 <AnimatePresence>
//                     {imagePreviewUrl && (
//                         <motion.div className="mb-6 relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                             <img src={imagePreviewUrl} alt="Preview" className="w-full rounded-xl shadow-lg border object-cover max-h-80" />
//                             <button onClick={clearImage} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700">
//                                 <XCircle className="w-6 h-6" />
//                             </button>
//                             <div className="mt-4">
//                                 <button onClick={classifyImage} disabled={isLoading} className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
//                                     {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Classifying...</> : <><Search className="w-5 h-5" /> Classify</>}
//                                 </button>
//                             </div>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 {error && <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-4 animate-pulse">{error}</div>}

//               {classificationResult && (
//   <motion.div
//     className="bg-green-100 border border-green-300 text-green-900 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base shadow-sm"
//     initial="hidden"
//     animate="visible"
//     variants={fadeIn}
//   >
//     <h2 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2">
//       <Recycle className="w-5 h-5 text-green-600" /> Classification Result
//     </h2>
//     <p className="mb-1">
//       <span className="font-medium text-green-800">Category:</span> {classificationResult.category}
//     </p>
//     <p className="mb-1">
//       <span className="font-medium text-green-800">Confidence:</span> {(classificationResult.confidence * 100).toFixed(2)}%
//     </p>
//     <p className="text-gray-800 leading-snug">{classificationResult.disposal}</p>
//   </motion.div>
// )}

//                 <div className="mt-8">
//                     <h2 className="text-xl font-bold text-teal-700 mb-3 flex items-center gap-2">
//                         <MapPin className="w-5 h-5 text-indigo-500" /> Recycling Centers Nearby
//                     </h2>
//                     {userLocation ? (
//                         <>
//                             <p className="text-sm text-gray-600 mb-3">Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</p>
//                             <button onClick={findRecyclingCenters} disabled={isLoading} className="w-full py-3 px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
//                                 {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</> : <><MapPin className="w-5 h-5" /> Find Centers</>}
//                             </button>
//                             <div className="mt-4 space-y-3">
//                                 {recyclingCenters.map((center, idx) => (
//                                     <motion.div key={idx} className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm" initial="hidden" animate="visible" variants={fadeIn}>
//                                         <p className="font-bold text-blue-700">{center.name}</p>
//                                         <p className="text-sm text-gray-700">{center.address}</p>
//                                         <p className="text-xs text-gray-500">Distance: {center.distance}</p>
//                                         <p className="text-xs text-gray-500">Accepted: {center.materials.join(', ')}</p>
//                                     </motion.div>
//                                 ))}
//                             </div>
//                         </>
//                     ) : (
//                         <p className="text-sm text-red-500">Location access denied.</p>
//                     )}
//                 </div>
//             </motion.div>
//         </div>
//     );
// };

// export default App;


import React, { useState, useRef, useEffect } from 'react';
import { ImageUp, Loader2, MapPin, Recycle, Search, XCircle } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { motion, AnimatePresence } from 'framer-motion';

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const App = () => {
    const [model, setModel] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [classificationResult, setClassificationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [recyclingCenters, setRecyclingCenters] = useState([]);

    const fileInputRef = useRef(null);

    useEffect(() => {
        tf.ready().then(() => {
            tf.loadLayersModel('/model/model.json')
                .then(setModel)
                .catch(err => setError('Failed to load model: ' + err.message));
        });
    }, []);

    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => {
                let msg = "Unable to retrieve your location.";
                if (err.code === err.PERMISSION_DENIED) msg = "Location access denied.";
                if (err.code === err.POSITION_UNAVAILABLE) msg = "Location info unavailable.";
                if (err.code === err.TIMEOUT) msg = "Location request timed out.";
                setError(msg);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file?.type.startsWith('image/')) {
            setSelectedImage(file);
            setImagePreviewUrl(URL.createObjectURL(file));
            setClassificationResult(null);
            setError(null);
            setRecyclingCenters([]);
        } else {
            setError('Please upload a valid image file.');
            setSelectedImage(null);
            setImagePreviewUrl(null);
        }
    };

    const classifyImage = async () => {
        if (!selectedImage || !model) return setError('Upload image & wait for model.');

        setIsLoading(true);
        setError(null);

        try {
            const img = new Image();
            img.src = imagePreviewUrl;
            img.crossOrigin = 'anonymous';
            img.onload = async () => {
                const tensor = tf.browser.fromPixels(img)
                  .resizeNearestNeighbor([224, 224])
                    .toFloat().div(tf.scalar(255.0)).expandDims();
                const prediction = model.predict(tensor);
                const predictionArray = await prediction.data();
                const categoryIndex = predictionArray.indexOf(Math.max(...predictionArray));

                const categories = ['Cardboard', 'Glass', 'Metal', 'Paper', 'Plastic', 'Trash'];
                const disposalTipMap = {
                  'Cardboard': "Flatten and place in the paper recycling bin. Keep it dry.",
                  'Glass': "Rinse and place in the glass recycling bin. Remove lids or caps.",
                  'Metal': "Rinse and recycle in the metal bin. Aluminum cans can be crushed to save space.",
                  'Paper': "Bundle and keep dry before placing in the paper recycling bin.",
                  'Plastic': "Check the recycling number. Rinse thoroughly and place in the plastic recycling bin.",
                  'Trash': "Dispose of in the general landfill bin. Not recyclable."
                };

                setClassificationResult({
                    category: categories[categoryIndex],
                    confidence: predictionArray[categoryIndex],
                    disposal: disposalTipMap[categories[categoryIndex]],
                });

                setIsLoading(false);
            };
        } catch (err) {
            setError('Classification failed: ' + err.message);
            setIsLoading(false);
        }
    };

    const findRecyclingCenters = async () => {
        if (!userLocation) return setError('Location required.');
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:5001/recycling-centers?lat=${userLocation.latitude}&lon=${userLocation.longitude}`);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            setRecyclingCenters(data);
        } catch (err) {
            setError('Finding centers failed: ' + err.message);
            setRecyclingCenters([]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreviewUrl(null);
        setClassificationResult(null);
        setError(null);
        setRecyclingCenters([]);
    };

    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4 font-sans text-gray-800 flex items-center justify-center">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-teal-300">
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.png" alt="EcoSort Logo" className="w-20 h-20 mb-2" />
                    <h1 className="text-4xl font-extrabold text-teal-700">EcoSort</h1>
                    <p className="text-sm text-gray-600 mt-1 text-center max-w-md">Empowering smarter waste decisions with AI. Upload your waste image to discover how to dispose of it responsibly.</p>
                </div>

                <div className="mb-6 border-2 border-dashed border-teal-400 rounded-xl p-6 text-center hover:bg-teal-100 transition">
                    <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
                    <button onClick={() => fileInputRef.current.click()} className="w-full py-3 px-6 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2">
                        <ImageUp className="w-5 h-5" /> Upload Image
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Accepted: JPG, PNG, GIF</p>
                </div>

                <AnimatePresence>
                    {imagePreviewUrl && (
                        <motion.div className="mb-6 relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <img src={imagePreviewUrl} alt="Preview" className="w-full rounded-xl shadow-lg border object-cover max-h-80" />
                            <button onClick={clearImage} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700">
                                <XCircle className="w-6 h-6" />
                            </button>
                            <div className="mt-4">
                                <button onClick={classifyImage} disabled={isLoading} className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
                                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Classifying...</> : <><Search className="w-5 h-5" /> Classify</>}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-4 animate-pulse">{error}</div>}

              {classificationResult && (
  <motion.div
    className="bg-green-100 border border-green-300 text-green-900 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base shadow-sm"
    initial="hidden"
    animate="visible"
    variants={fadeIn}
  >
    <h2 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2">
      <Recycle className="w-5 h-5 text-green-600" /> Classification Result
    </h2>
    <p className="mb-1">
      <span className="font-medium text-green-800">Category:</span> {classificationResult.category}
    </p>
    <p className="mb-1">
      <span className="font-medium text-green-800">Confidence:</span> {(classificationResult.confidence * 100).toFixed(2)}%
    </p>
    <p className="text-gray-800 leading-snug">{classificationResult.disposal}</p>
  </motion.div>
)}

                <div className="mt-8">
                    <h2 className="text-xl font-bold text-teal-700 mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-indigo-500" /> Recycling Centers Nearby
                    </h2>
                    {userLocation ? (
                        <>
                            <p className="text-sm text-gray-600 mb-3">Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</p>
                            <button onClick={findRecyclingCenters} disabled={isLoading} className="w-full py-3 px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</> : <><MapPin className="w-5 h-5" /> Find Centers</>}
                            </button>
                            <div className="mt-4 space-y-3">
                                {recyclingCenters.map((center, idx) => (
                                    <motion.div key={idx} className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm" initial="hidden" animate="visible" variants={fadeIn}>
                                        <p className="font-bold text-blue-700">{center.name}</p>
                                        <p className="text-sm text-gray-700">{center.address}</p>
                                        <p className="text-xs text-gray-500">Distance: {center.distance}</p>
                                        <p className="text-xs text-gray-500">Accepted: {center.materials.join(', ')}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-red-500">Location access denied.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default App;