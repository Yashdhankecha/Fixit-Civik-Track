import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  MapPin, 
  Camera, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Shield,
  Eye,
  Clock,
  Star,
  Plus,
  FileImage,
  Trash2
} from 'lucide-react';
import { useIssue } from '../contexts/IssueContext';
import { useLocation } from '../contexts/LocationContext';
import toast from 'react-hot-toast';

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const { createIssue } = useIssue();
  const { selectedLocation, getAddressFromCoords } = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const categories = [
    { value: 'roads', label: 'Roads', icon: '🛣️', description: 'Potholes, obstructions, road damage', color: 'from-orange-500 to-red-500' },
    { value: 'lighting', label: 'Lighting', icon: '💡', description: 'Broken or flickering street lights', color: 'from-yellow-500 to-orange-500' },
    { value: 'water', label: 'Water Supply', icon: '💧', description: 'Leaks, low pressure, water issues', color: 'from-blue-500 to-cyan-500' },
    { value: 'cleanliness', label: 'Cleanliness', icon: '🗑️', description: 'Overflowing bins, garbage', color: 'from-purple-500 to-pink-500' },
    { value: 'safety', label: 'Public Safety', icon: '⚠️', description: 'Open manholes, exposed wiring', color: 'from-red-500 to-pink-500' },
    { value: 'obstructions', label: 'Obstructions', icon: '🌳', description: 'Fallen trees, debris', color: 'from-green-500 to-emerald-500' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', description: 'Minor inconvenience', color: 'from-green-500 to-emerald-500' },
    { value: 'medium', label: 'Medium', description: 'Moderate impact', color: 'from-yellow-500 to-orange-500' },
    { value: 'high', label: 'High', description: 'Significant problem', color: 'from-orange-500 to-red-500' },
    { value: 'critical', label: 'Critical', description: 'Safety hazard', color: 'from-red-500 to-pink-500' },
  ];

  const steps = [
    { number: 1, title: 'Category', description: 'Select issue type', icon: Shield },
    { number: 2, title: 'Details', description: 'Describe the problem', icon: Eye },
    { number: 3, title: 'Location', description: 'Confirm location', icon: MapPin },
    { number: 4, title: 'Photos', description: 'Add images', icon: Camera },
    { number: 5, title: 'Review', description: 'Submit report', icon: CheckCircle },
  ];

  // Get address when location changes
  React.useEffect(() => {
    if (selectedLocation) {
      getAddressFromCoords(selectedLocation.lat, selectedLocation.lng)
        .then(address => setLocationAddress(address));
    }
  }, [selectedLocation]);

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5
  });

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      return newImages;
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      toast.error('Please select a location');
      return;
    }

    setIsSubmitting(true);
    try {
      const issueData = {
        ...data,
        location: selectedLocation,
        images: images.map(img => img.file),
      };

      const result = await createIssue(issueData);
      if (result.success) {
        toast.success('Issue reported successfully!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                What type of issue are you reporting?
              </h3>
              <p className="text-gray-600">
                Select the category that best describes the problem
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <motion.label
                  key={category.value}
                  className={`relative p-6 bg-white/80 backdrop-blur-xl rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    watch('category') === category.value
                      ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                      : 'border-white/20 hover:border-blue-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    value={category.value}
                    {...register('category', { required: 'Please select a category' })}
                    className="sr-only"
                  />
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg mb-1">
                        {category.label}
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {category.description}
                      </div>
                    </div>
                  </div>
                  {watch('category') === category.value && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <CheckCircle size={16} className="text-white" />
                    </motion.div>
                  )}
                </motion.label>
              ))}
            </div>
            {errors.category && (
              <motion.p 
                className="text-red-600 text-sm mt-4 text-center bg-red-50 p-3 rounded-xl border border-red-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.category.message}
              </motion.p>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Eye className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Describe the issue
              </h3>
              <p className="text-gray-600">
                Provide detailed information to help us understand the problem
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Title *
                </label>
                <input
                  type="text"
                  {...register('title', { 
                    required: 'Title is required',
                    maxLength: { value: 50, message: 'Title must be less than 50 characters' }
                  })}
                  className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Brief description of the issue"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-2">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Description *
                </label>
                <textarea
                  {...register('description', { 
                    required: 'Description is required',
                    maxLength: { value: 500, message: 'Description must be less than 500 characters' }
                  })}
                  rows={5}
                  className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                  placeholder="Provide detailed information about the issue..."
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-2">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Severity Level
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {severityLevels.map((level) => (
                    <motion.label
                      key={level.value}
                      className={`relative p-4 bg-white/80 backdrop-blur-xl rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        watch('severity') === level.value
                          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                          : 'border-white/20 hover:border-blue-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        value={level.value}
                        {...register('severity')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className={`w-8 h-8 bg-gradient-to-br ${level.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                          <Star size={16} className="text-white" />
                        </div>
                        <div className="font-bold text-gray-900 text-sm">
                          {level.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {level.description}
                        </div>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <input
                  type="checkbox"
                  id="anonymous"
                  {...register('anonymous')}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="anonymous" className="text-gray-700 font-medium">
                  Report anonymously
                </label>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Confirm Location
              </h3>
              <p className="text-gray-600">
                Verify the location where the issue is occurring
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <MapPin className="text-white" size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Current Location</div>
                    <div className="text-sm text-gray-600">Automatically detected</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 font-medium">
                    {locationAddress || 'Loading address...'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Lat: {selectedLocation?.lat?.toFixed(6)}, Lng: {selectedLocation?.lng?.toFixed(6)}
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <div className="font-semibold mb-1">Location Information</div>
                    <p>
                      Location is automatically detected from your device. 
                      You can adjust the location on the map if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Camera className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Add Photos (Optional)
              </h3>
              <p className="text-gray-600">
                Visual evidence helps us understand and resolve issues faster
              </p>
            </div>
            
            <div className="space-y-6">
              <motion.div
                {...getRootProps()}
                className={`relative p-8 bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer hover:scale-105 ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <FileImage className="text-white" size={24} />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {isDragActive ? 'Drop images here' : 'Upload Images'}
                  </p>
                  <p className="text-gray-600 mb-2">
                    {isDragActive
                      ? 'Release to upload'
                      : 'Drag & drop images here, or click to select'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Up to 5 images, max 5MB each
                  </p>
                </div>
              </motion.div>

              {images.length > 0 && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="font-semibold text-gray-900">Uploaded Images ({images.length}/5)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <motion.div 
                        key={index} 
                        className="relative group"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-2xl shadow-lg"
                        />
                        <motion.button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Review Your Report
              </h3>
              <p className="text-gray-600">
                Please review all information before submitting
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield size={20} className="text-blue-600" />
                  <span>Issue Details</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Category:</span>
                    <span className="text-gray-900 font-semibold">
                      {categories.find(c => c.value === watch('category'))?.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Title:</span>
                    <span className="text-gray-900 font-semibold">{watch('title')}</span>
                  </div>
                  <div className="py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium block mb-1">Description:</span>
                    <span className="text-gray-900">{watch('description')}</span>
                  </div>
                  {watch('severity') && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Severity:</span>
                      <span className="text-gray-900 font-semibold">
                        {severityLevels.find(s => s.value === watch('severity'))?.label}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Location:</span>
                    <span className="text-gray-900 font-semibold">{locationAddress}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Anonymous:</span>
                    <span className="text-gray-900 font-semibold">
                      {watch('anonymous') ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {images.length > 0 && (
                <motion.div 
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Camera size={20} className="text-purple-600" />
                    <span>Photos ({images.length})</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-xl shadow-md"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-60 h-60 bg-indigo-200 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="text-white" size={24} />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900">
              Report an Issue
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Help improve your community by reporting civic problems
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-8 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex items-center">
                  <motion.div 
                    className={`flex items-center justify-center w-12 h-12 rounded-2xl text-sm font-bold transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                      currentStep > step.number ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-gray-900">
              {steps[currentStep - 1].title}
            </span>
            <span className="text-gray-600 ml-2">
              - {steps[currentStep - 1].description}
            </span>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div 
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </motion.div>

          {/* Navigation */}
          <motion.div 
            className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={18} />
              <span>Previous</span>
            </motion.button>

            {currentStep < steps.length ? (
              <motion.button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle size={18} />
                )}
                <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
              </motion.button>
            )}
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssuePage; 