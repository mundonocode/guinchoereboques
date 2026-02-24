import { supabase } from './supabase';

export const uploadImage = async (uri: string, bucket: string = 'avatars'): Promise<string | null> => {
    try {
        if (!uri || uri.startsWith('http')) return uri;

        const response = await fetch(uri);
        const blob = await response.blob();

        const fileExt = uri.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, blob, {
                contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
            });

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Unexpected error in uploadImage:', error);
        return null;
    }
};
