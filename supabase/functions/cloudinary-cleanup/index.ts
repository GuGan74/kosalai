import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { v2 as cloudinary } from 'npm:cloudinary@1.41.0'

// 1. Initialize Cloudinary Admin API
cloudinary.config({
  cloud_name: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: Deno.env.get('CLOUDINARY_API_KEY'),
  api_secret: Deno.env.get('CLOUDINARY_API_SECRET'),
});

// 2. Production-safe URL Parser
function extractPublicId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return null;
  
  let path = url.substring(uploadIndex + 8);
  
  // Remove file extension (.jpg, .png, .webp)
  const dotIndex = path.lastIndexOf('.');
  if (dotIndex !== -1) path = path.substring(0, dotIndex);
  
  const segments = path.split('/');
  const publicIdSegments = [];
  
  for (const segment of segments) {
    // Skip version (v1775994936)
    if (/^v\d+$/.test(segment)) continue;
    // Skip transformations (w_400, f_auto, q_auto)
    if (/^[a-z]_/.test(segment) || segment === 'f_auto' || segment === 'q_auto' || segment.includes(',')) continue;
    publicIdSegments.push(segment);
  }
  
  return publicIdSegments.join('/');
}

// 3. Webhook Handler
serve(async (req) => {
  try {
    const { old_record } = await req.json();
    if (!old_record) {
      return new Response(JSON.stringify({ error: 'No old_record provided' }), { status: 400 });
    }

    const urls = new Set<string>();
    
    // Support both legacy (image_url) and modern (image_urls) formats
    if (old_record.image_url) urls.add(old_record.image_url);
    if (Array.isArray(old_record.image_urls)) {
      old_record.image_urls.forEach((u: string) => urls.add(u));
    }

    const publicIds = Array.from(urls)
      .map(extractPublicId)
      .filter(id => id !== null) as string[];

    if (publicIds.length === 0) {
      return new Response(JSON.stringify({ message: 'No images to delete' }), { status: 200 });
    }

    // 4. Secure Bulk Deletion via Cloudinary Admin API
    const result = await cloudinary.api.delete_resources(publicIds);
    
    console.log("Cleanup successful for:", publicIds, result);

    return new Response(JSON.stringify({ message: 'Success', result }), { 
      headers: { 'Content-Type': 'application/json' },
      status: 200 
    });
  } catch (error: any) {
    console.error("Cleanup Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})
