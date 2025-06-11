'use client';

import { useParams } from 'next/navigation';
import PostForm from '../../PostForm';

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;
  
  return <PostForm postId={postId} />;
}