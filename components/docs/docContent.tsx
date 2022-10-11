import { useKryptikThemeContext } from '../ThemeProvider';
import markdownStylesLight from './markdownStyles.module.css'
import markdownStylesDark from './markdownStylesDark.module.css'
import DOMPurify from 'isomorphic-dompurify';


type Props = {
  content: string
}

const DocContent = ({ content }: Props) => {
const {isDark} = useKryptikThemeContext();
// sanitize incoming content
const cleanContent = DOMPurify.sanitize(content);
  return (
    <div className="max-w-3xl mx-auto">
      <div
        className={isDark?markdownStylesDark['markdown']:markdownStylesLight['markdown']}
        dangerouslySetInnerHTML={{ __html: cleanContent}}
      />
    </div>
  )
}

export default DocContent