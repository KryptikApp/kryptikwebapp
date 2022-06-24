import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { KryptikAuthProvider } from '../components/KryptikAuthProvider'
import { KryptikThemeProvider } from '../components/ThemeProvider'


function MyApp({ Component, pageProps }: AppProps) {
  return(
      <KryptikAuthProvider>
        <KryptikThemeProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </KryptikThemeProvider>
      </KryptikAuthProvider>
  )
}

export default MyApp
