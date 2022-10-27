import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { KryptikAuthProvider } from '../components/KryptikAuthProvider'
import { KryptikThemeProvider } from '../components/ThemeProvider'
import router from 'next/router'
import { useEffect } from 'react'
import LayoutDevDocs from '../components/LayoutDevDocs'
import 'highlight.js/styles/github-dark-dimmed.css';


function MyApp({ Component, pageProps, router }: AppProps) {
  const handleOffline = function(){
    router.push('../status/offline')
  }

  const addOfflineHandler = function(){
    // handle if offline
    if(!window.navigator.onLine){
      handleOffline()
    }
    // add connection handler
    window.addEventListener('offline', () => handleOffline())
  }

  useEffect(()=> 
    addOfflineHandler(),[]
  )
  
  if(router.pathname.startsWith("/developer")){
    return(
        <KryptikAuthProvider>
          <KryptikThemeProvider>
            <LayoutDevDocs>
              <Component {...pageProps} />
            </LayoutDevDocs>
          </KryptikThemeProvider>
        </KryptikAuthProvider>
    )
  }
  else{
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
 
}

export default MyApp
