import { useState } from 'react'

import { uploadImageToCloudinary } from '@/lib/utils'

function TestUploadPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    try {
      setLoading(true)
      setError(null)

      const result = await uploadImageToCloudinary(file)

      console.log('Cloudinary response:', result)
      setImageUrl(result.secure_url)
    } catch (err) {
      console.error(err)
      setError('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Test Cloudinary Upload</h2>

      <input
        type='file'
        accept='image/*'
        onChange={e => {
          if (e.target.files?.[0]) {
            handleUpload(e.target.files[0])
          }
        }}
      />

      {loading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {imageUrl && (
        <div style={{ marginTop: 16 }}>
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt='Uploaded' style={{ width: 300, borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}

export default TestUploadPage
