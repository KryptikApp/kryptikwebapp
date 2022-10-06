import { ca } from "date-fns/locale";
import { Token } from "graphql";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { TokenDb } from "../../src/services/models/token";
import { useKryptikThemeContext } from "../ThemeProvider";

interface Props {
    token:TokenDb
}
const TokenCard:NextPage<Props> = (props) => {
    const {isDark} = useKryptikThemeContext()
    const {token} = {...props};
    const cardId = token.name;
    const cardTitleId = cardId + "Title";
    useEffect(()=>{
        if (typeof document !== 'undefined') {
        // change title color on hover
        document.getElementById(cardId)?.addEventListener("mouseover", ()=>{
            let cardTitle = document.getElementById(cardTitleId);
            if(!cardTitle) return;
            cardTitle.style.color = token.hexColor;
        })
        document.getElementById(cardId)?.addEventListener("mouseout", ()=>{
            console.log("pooo")
            let cardTitle = document.getElementById(cardTitleId);
            if(!cardTitle) return;
            if(isDark){
                cardTitle.style.color = "white"
            }
            else{
                cardTitle.style.color = "black"
            }
        })
        }
    }, [])
    return(
        <div id={`${cardId}`} className="border border-gray-100 dark:border-gray-800 rounded-lg px-2 py-4">
            <div className="flex flex-row space-x-2">
                <img className="w-8 h-8 rounded-full my-auto" src={token.logoURI} alt={`${token.name} image`}/>
                <h1 id={`${cardTitleId}`} className="text-xl text-black dark:text-white">{token.name}</h1>
            </div>
        </div>
    )   
}

export default TokenCard;