'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { createProperty, updateProperty } from '../../lib/actions/admin';

interface PropertyFormProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property?: any; // Replace with proper type if available
}

export default function PropertyForm({ lang, property }: PropertyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: property?.title || '',
    price_numeric: property?.price_numeric || '',
    status: property?.tag || 'for-sale',
    type: property?.type || 'apartment',
    description: property?.description_i18n?.[lang] || '',
    location: property?.location || '',
    latitude: property?.latitude || '',
    longitude: property?.longitude || '',
    area: property?.area || '',
    beds: property?.beds || 3,
    baths: property?.baths || 2,
    garages: property?.garages || 0,
    amenities: property?.amenities || [],
    images: property?.images || [],
    highlight_tag: Array.isArray(property?.highlight_tag) ? property.highlight_tag.join(', ') : (property?.highlight_tag || ''),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (id: string, value: number) => {
    setFormData((prev) => {
      let nextAmenities = prev.amenities;
      if (id === 'garages') {
        const normalizedParking = 'parking';
        if (value === 0) {
          nextAmenities = prev.amenities.filter((a: string) => a !== normalizedParking);
        } else if (value >= 1 && !prev.amenities.includes(normalizedParking)) {
          nextAmenities = [...prev.amenities, normalizedParking];
        }
      }
      return { ...prev, [id]: value, amenities: nextAmenities };
    });
  };

  const normalizeAmenity = (name: string) => name.toLowerCase().replace(/ /g, '-').replace('wifi', 'wi-fi');

  const handleAmenityChange = (amenity: string) => {
    const normalized = normalizeAmenity(amenity);
    setFormData((prev) => {
      const isRemoving = prev.amenities.includes(normalized);
      const amenities = isRemoving
        ? prev.amenities.filter((a: string) => a !== normalized)
        : [...prev.amenities, normalized];
      
      let nextGarages = prev.garages;
      if (normalized === 'parking') {
        if (isRemoving) {
          nextGarages = 0;
        } else {
          nextGarages = prev.garages === 0 ? 1 : prev.garages;
        }
      }
      
      return { ...prev, amenities, garages: nextGarages };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const newImages = [...formData.images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `properties/${fileName}`;

      const { error } = await supabase.storage
        .from('properties')
        .upload(filePath, file);

      if (error) {
        alert(`Error uploading image: ${error.message}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath);

      newImages.push(publicUrl);
    }

    setFormData((prev) => ({ ...prev, images: newImages }));
    setUploading(false);
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const highlightTagsArray = formData.highlight_tag
        ? formData.highlight_tag
            .split(',')
            .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
            .filter(t => t !== '')
        : [];

      const dataToSubmit = {
        ...formData,
        highlight_tag: highlightTagsArray,
        price: `$${Number(formData.price_numeric).toLocaleString()}`, // Format price as string
        description_i18n: {
          ...property?.description_i18n,
          [lang]: formData.description,
        },
      };

      let result;
      if (property?.id) {
        result = await updateProperty(property.id, dataToSubmit);
      } else {
        result = await createProperty(dataToSubmit);
      }

      if (result.success) {
        router.push(`/${lang}/admin/properties`);
        router.refresh();
      } else {
        alert(`Error: ${result.error}`);
      }
    });
  };

  const amenitiesList = [
    'Swimming Pool',
    'Garden',
    'Air Conditioning',
    'Smart Home',
    'Gym',
    'Spa',
    'Security System',
    'Parking',
    'Wi-Fi',
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium font-sf-pro">
              <li><Link className="hover:text-mosque transition-colors" href={`/${lang}/admin/properties`}>Properties</Link></li>
              <li><span className="material-icons text-xs text-gray-400">chevron_right</span></li>
              <li aria-current="page" className="text-nordic">{property ? 'Edit Property' : 'Add New'}</li>
            </ol>
          </nav>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-nordic tracking-tight mb-2">{property ? 'Edit Property' : 'Add New Property'}</h1>
            <p className="text-base text-gray-500 max-w-2xl font-normal font-sf-pro">
              Fill in the details below to {property ? 'update the' : 'create a new'} listing. Fields marked with * are mandatory.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/${lang}/admin/properties`} className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-nordic hover:bg-gray-50 transition-colors font-medium font-sf-pro text-sm">
            Cancel
          </Link>
          <button 
            onClick={handleSubmit}
            disabled={isPending || uploading}
            className="px-5 py-2.5 rounded-lg bg-mosque hover:bg-nordic text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-sf-pro text-sm disabled:opacity-50"
          >
            <span className="material-icons text-sm">{isPending ? 'refresh' : 'save'}</span>
            {isPending ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </header>

      <form className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start" onSubmit={handleSubmit}>
        <div className="xl:col-span-8 space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                <span className="material-icons text-lg">info</span>
              </div>
              <h2 className="text-xl font-bold text-nordic">Basic Information</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="title">Property Title <span className="text-red-500">*</span></label>
                <input 
                  className="w-full text-base px-4 py-2.5 rounded-md border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro" 
                  id="title" 
                  placeholder="e.g. Modern Penthouse with Ocean View" 
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="price_numeric">Price <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-sf-pro text-sm">$</span>
                    <input 
                      className="w-full pl-7 pr-4 py-2.5 rounded-md border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-medium font-sf-pro" 
                      id="price_numeric" 
                      placeholder="0.00" 
                      type="number"
                      value={formData.price_numeric}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="status">Status</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-md border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro cursor-pointer" 
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="for-sale">For Sale</option>
                    <option value="for-rent">For Rent</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="type">Property Type</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-md border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro cursor-pointer" 
                    id="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="highlight_tag">Highlight Tag</label>
                  <input 
                    className="w-full text-base px-4 py-2.5 rounded-md border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro" 
                    id="highlight_tag" 
                    placeholder="e.g. Exclusive, New" 
                    type="text"
                    value={formData.highlight_tag}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                <span className="material-icons text-lg">description</span>
              </div>
              <h2 className="text-xl font-bold text-nordic">Description</h2>
            </div>
            <div className="p-8">
              <textarea 
                className="w-full px-4 py-3 rounded-md border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro leading-relaxed resize-y min-h-[200px]" 
                id="description" 
                placeholder="Describe the property features, neighborhood, and unique selling points..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* Gallery */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-hint-green/30 flex justify-between items-center bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                  <span className="material-icons text-lg">image</span>
                </div>
                <h2 className="text-xl font-bold text-nordic">Gallery</h2>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded font-sf-pro">JPG, PNG, WEBP</span>
            </div>
            <div className="p-8">
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-10 text-center hover:bg-hint-green/10 hover:border-mosque/40 transition-colors cursor-pointer group">
                <input 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  multiple 
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-mosque group-hover:scale-110 transition-transform duration-300">
                    <span className="material-icons text-2xl">{uploading ? 'refresh' : 'cloud_upload'}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-nordic font-sf-pro">{uploading ? 'Uploading...' : 'Click or drag images here'}</p>
                    <p className="text-xs text-gray-400 font-sf-pro">Max file size 5MB per image</p>
                  </div>
                </div>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {formData.images.map((url: string, index: number) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden relative group shadow-sm">
                      <img alt={`Property image ${index + 1}`} className="w-full h-full object-cover" src={url} />
                      <div className="absolute inset-0 bg-nordic/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <button 
                          className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors" 
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
                      </div>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-mosque text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm font-sf-pro uppercase tracking-wider">Main</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                <span className="material-icons text-lg">place</span>
              </div>
              <h2 className="text-lg font-bold text-nordic">Location</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="location">Address</label>
                <input 
                  className="w-full px-4 py-2.5 rounded-md border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro" 
                  id="location" 
                  placeholder="Street Address, City, Zip" 
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              {/* Added Latitude and Longitude */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="latitude">Latitude</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-md border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro" 
                    id="latitude" 
                    placeholder="0.000000" 
                    type="number" 
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="longitude">Longitude</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-md border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro" 
                    id="longitude" 
                    placeholder="0.000000" 
                    type="number" 
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                <span className="material-icons text-lg">straighten</span>
              </div>
              <h2 className="text-lg font-bold text-nordic">Details</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="group">
                  <label className="text-xs text-gray-500 font-medium font-sf-pro mb-1 block" htmlFor="area">Area</label>
                  <input 
                    className="w-full text-left px-3 py-2 rounded border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro text-sm" 
                    id="area" 
                    placeholder="e.g. 1,200 sqft" 
                    type="text"
                    value={formData.area}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <hr className="border-gray-100"/>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-nordic font-sf-pro flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">bed</span> Bedrooms
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                    <button 
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100" 
                      type="button"
                      onClick={() => handleNumberChange('beds', Math.max(0, formData.beds - 1))}
                    >-</button>
                    <input className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium font-sf-pro" readOnly type="text" value={formData.beds}/>
                    <button 
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100" 
                      type="button"
                      onClick={() => handleNumberChange('beds', formData.beds + 1)}
                    >+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-nordic font-sf-pro flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">shower</span> Bathrooms
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                    <button 
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100" 
                      type="button"
                      onClick={() => handleNumberChange('baths', Math.max(0, formData.baths - 1))}
                    >-</button>
                    <input className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium font-sf-pro" readOnly type="text" value={formData.baths}/>
                    <button 
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100" 
                      type="button"
                      onClick={() => handleNumberChange('baths', formData.baths + 1)}
                    >+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-nordic font-sf-pro flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">directions_car</span> Garages
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                    <button 
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100" 
                      type="button"
                      onClick={() => handleNumberChange('garages', Math.max(0, formData.garages - 1))}
                    >-</button>
                    <input className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium font-sf-pro" readOnly type="text" value={formData.garages}/>
                    <button 
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100" 
                      type="button"
                      onClick={() => handleNumberChange('garages', formData.garages + 1)}
                    >+</button>
                  </div>
                </div>
              </div>
              <hr className="border-gray-100"/>
              <div>
                <h3 className="text-sm font-bold text-nordic mb-3 font-sf-pro uppercase tracking-wider text-xs text-gray-500">Amenities</h3>
                <div className="space-y-2">
                  {amenitiesList.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        className="w-4 h-4 text-mosque border-gray-300 rounded focus:ring-mosque" 
                        type="checkbox"
                        checked={formData.amenities.includes(normalizeAmenity(amenity))}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      <span className="text-sm text-gray-700 font-sf-pro group-hover:text-nordic transition-colors">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
