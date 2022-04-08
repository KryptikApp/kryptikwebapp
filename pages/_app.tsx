import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../components/AuthProvider'
import Layout from '../components/Layout'
import { KryptikServiceProvider } from '../components/KryptikProvider'


function MyApp({ Component, pageProps }: AppProps) {
  return(
    <KryptikServiceProvider>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </KryptikServiceProvider>
    
  )
}

export default MyApp
