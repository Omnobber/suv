import { useEffect } from 'react';

function setMeta(name, content, attribute = 'name') {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function Seo({ title, description, image, schema }) {
  useEffect(() => {
    if (title) document.title = title;
    setMeta('description', description || 'Belimaa handcrafted premium commerce experience.');
    setMeta('og:title', title || 'Belimaa', 'property');
    setMeta('og:description', description || 'Belimaa handcrafted premium commerce experience.', 'property');
    if (image) setMeta('og:image', image, 'property');
  }, [title, description, image]);

  return schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /> : null;
}
