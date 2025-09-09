"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Car {
  id: string
  make: string
  model: string
  year: number
  color: string
  license_plate: string
  fuel_type: string
  transmission: string
  seats: number
  daily_rate: number
  location: string
  status: string
  mileage: number
  features?: string[]
  description?: string
  image_url?: string[]
}

interface CarEditFormProps {
  car?: Car
  isNew?: boolean
}

export function CarEditForm({ car, isNew = false }: CarEditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(car?.image_url || [])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [addMethod, setAddMethod] = useState<'upload' | 'url'>('upload')
  const [formData, setFormData] = useState<Car>({
    id: car?.id || "",
    make: car?.make || "",
    model: car?.model || "",
    year: car?.year || new Date().getFullYear(),
    color: car?.color || "",
    license_plate: car?.license_plate || "",
    fuel_type: car?.fuel_type || "petrol",
    transmission: car?.transmission || "automatic",
    seats: car?.seats || 5,
    daily_rate: car?.daily_rate || 0,
    location: car?.location || "Accra",
    status: car?.status || "available",
    mileage: car?.mileage || 0,
    features: car?.features || [],
    description: car?.description || "",
    image_url: car?.image_url || [],
  })
  
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNumberChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value === "" ? 0 : Number(value)
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const newFiles = Array.from(e.target.files)
    setImages([...images, ...newFiles])
    
    // Create preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])
  }
  
  const handleAddImageByUrl = () => {
    if (!imageUrlInput || !isValidImageUrl(imageUrlInput)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive"
      })
      return
    }
    
    // Add the URL to previews and formData
    setImagePreviews([...imagePreviews, imageUrlInput])
    
    // Update the form data
    const newImageUrls = [...(formData.image_url || [])]
    newImageUrls.push(imageUrlInput)
    setFormData(prev => ({
      ...prev,
      image_url: newImageUrls
    }))
    
    // Clear the input field
    setImageUrlInput('')
  }
  
  const isValidImageUrl = (url: string) => {
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase()) || 
             url.startsWith('https://rgylguufggdiybalvhfi.supabase.co/storage/v1/object/public/')
    } catch (_) {
      return false
    }
  }

  const removeImage = (index: number) => {
    // Remove from both the files array and previews array
    const newImages = [...images]
    
    // Only remove from newly uploaded files if it's a new file
    const isExistingImageUrl = index < (car?.image_url?.length || 0)
    if (!isExistingImageUrl) {
      // Find the corresponding index in the images array (accounting for existing images)
      const imageIndex = index - (car?.image_url?.length || 0)
      if (imageIndex >= 0) {
        newImages.splice(imageIndex, 1)
        setImages(newImages)
      }
    }
    
    // Remove from preview
    const newPreviews = [...imagePreviews]
    newPreviews.splice(index, 1)
    setImagePreviews(newPreviews)
    
    // Update the form data image_url array
    const newImageUrls = [...(formData.image_url || [])]
    if (index < newImageUrls.length) {
      newImageUrls.splice(index, 1)
      setFormData(prev => ({
        ...prev,
        image_url: newImageUrls
      }))
    }
  }

  const uploadImages = async () => {
    if (images.length === 0) return formData.image_url || []
    
    const imageUrls = [...(formData.image_url || [])]
    
    // Upload each image
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `car_images/${formData.id}/${fileName}`
      
      setUploadProgress(Math.floor((i / images.length) * 50))
      
      const { data, error } = await supabase.storage
        .from('vehicles')
        .upload(filePath, file)
      
      if (error) {
        console.error('Error uploading image:', error)
        continue
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vehicles')
        .getPublicUrl(filePath)
      
      imageUrls.push(publicUrl)
      setUploadProgress(Math.floor(50 + (i / images.length) * 50))
    }
    
    return imageUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      let carId = formData.id
      
      // If it's a new car, insert it first to get the ID
      if (isNew) {
        const { data: newCar, error: insertError } = await supabase
          .from('cars')
          .insert({
            make: formData.make,
            model: formData.model,
            year: formData.year,
            color: formData.color,
            license_plate: formData.license_plate,
            fuel_type: formData.fuel_type,
            transmission: formData.transmission,
            seats: formData.seats,
            daily_rate: formData.daily_rate,
            location: formData.location,
            status: formData.status,
            mileage: formData.mileage,
            features: formData.features,
            description: formData.description,
            image_url: formData.image_url,
          })
          .select()
          .single()
        
        if (insertError) throw insertError
        carId = newCar.id
        setFormData(prev => ({ ...prev, id: carId }))
      }
      
      // Upload images and get URLs
      const imageUrls = await uploadImages()
      
      // Update the car data with image URLs
      const { error: updateError } = await supabase
        .from('cars')
        .update({
          make: formData.make,
          model: formData.model,
          year: formData.year,
          color: formData.color,
          license_plate: formData.license_plate,
          fuel_type: formData.fuel_type,
          transmission: formData.transmission,
          seats: formData.seats,
          daily_rate: formData.daily_rate,
          location: formData.location,
          status: formData.status,
          mileage: formData.mileage,
          features: formData.features,
          description: formData.description,
          image_url: imageUrls,
        })
        .eq('id', carId)
      
      if (updateError) throw updateError
      
      toast({
        title: isNew ? "Car Added" : "Car Updated",
        description: `The car has been successfully ${isNew ? 'added to' : 'updated in'} your fleet.`,
      })
      
      router.push('/admin/cars')
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the car")
      console.error("Error saving car:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Car Details</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="photos">Photos & Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                placeholder="Toyota"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Camry"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleNumberChange("year", e.target.value)}
                min="1950"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Silver"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_plate">License Plate</Label>
              <Input
                id="license_plate"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleInputChange}
                placeholder="GR-2345-22"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => handleNumberChange("mileage", e.target.value)}
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Write a description of the car..."
              rows={5}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="specs" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fuel_type">Fuel Type</Label>
              <Select
                value={formData.fuel_type}
                onValueChange={(value) => handleSelectChange("fuel_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Select
                value={formData.transmission}
                onValueChange={(value) => handleSelectChange("transmission", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                name="seats"
                type="number"
                value={formData.seats}
                onChange={(e) => handleNumberChange("seats", e.target.value)}
                min="1"
                max="20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily_rate">Daily Rate (GH₵)</Label>
              <Input
                id="daily_rate"
                name="daily_rate"
                type="number"
                value={formData.daily_rate}
                onChange={(e) => handleNumberChange("daily_rate", e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Accra"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="photos" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Car Photos</CardTitle>
              <CardDescription>
                Add photos of the car to showcase its features and condition.
                You can upload multiple photos or add them by URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2 pb-4">
                <Label>Add Images</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant={addMethod === 'upload' ? 'default' : 'outline'} 
                    onClick={() => setAddMethod('upload')}
                    className="flex-1"
                  >
                    Upload Files
                  </Button>
                  <Button 
                    type="button" 
                    variant={addMethod === 'url' ? 'default' : 'outline'} 
                    onClick={() => setAddMethod('url')}
                    className="flex-1"
                  >
                    Add by URL
                  </Button>
                </div>
              </div>
              
              {addMethod === 'upload' ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Car className="h-8 w-8 text-muted-foreground" />
                    <h3 className="font-semibold">Upload Car Photos</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag & drop images here or click to browse
                    </p>
                    <Input
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      className="max-w-sm"
                      id="car-images"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Enter image URL (https://...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddImageByUrl}
                  >
                    Add Image
                  </Button>
                </div>
              )}
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Photos ({imagePreviews.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                        <Image
                          src={src}
                          alt={`Car photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {isLoading && uploadProgress > 0 && (
        <div className="w-full bg-muted rounded-full h-2.5 mb-4">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-xs text-muted-foreground mt-1">
            Uploading images... {uploadProgress}%
          </p>
        </div>
      )}
      
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/cars')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isNew ? "Add Car" : "Update Car"}
        </Button>
      </div>
    </form>
  )
}
