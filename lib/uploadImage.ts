import { supabase } from '@/lib/supabase'

export async function uploadImage(file: File, folder: string) {
  const ext = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${ext}`
  const filePath = `${folder}/${fileName}`

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file, { upsert: false })

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath)

  return {
    path: filePath,
    url: data.publicUrl,
  }
}

export async function deleteImage(path: string) {
  const { error } = await supabase.storage
    .from('blog-images')
    .remove([path])

  if (error) {
    throw error
  }
}