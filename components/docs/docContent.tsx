import { useKryptikThemeContext } from '../ThemeProvider';
import markdownStylesLight from './markdownStyles.module.css'
import markdownStylesDark from './markdownStylesDark.module.css'
import DOMPurify from 'isomorphic-dompurify';
import { useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';


type Props = {
  content: string
}

const DocContent = ({ content }: Props) => {
const {isDark} = useKryptikThemeContext();

// copy and paste when code element is clicked
// TODO: add visual indication of copy ability before click
useEffect(()=>{
  // finda ll code chunks and add click event handler
  const codeChunks = document.querySelectorAll("code");
  if(!codeChunks) return;
  codeChunks.forEach((c)=>{
    c.onclick = ()=>{
      if(c.textContent){
        toast.success("Code copied!");
        // write code text to clipboard
        navigator.clipboard.writeText(c.textContent);
      }
    }
  })
}, [])

// sanitize incoming content
const cleanContent = DOMPurify.sanitize(content);
  return (
    <div className="max-w-3xl mx-auto">
      <Toaster/>
      <div
        className={isDark?markdownStylesDark['markdown']:markdownStylesLight['markdown']}
        dangerouslySetInnerHTML={{ __html: cleanContent}}
      />
    </div>
  )
}

export default DocContent