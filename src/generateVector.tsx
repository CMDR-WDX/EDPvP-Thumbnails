import { Props } from "./main";

import React from "react";
import satori from "satori"


import { readFile } from "fs/promises";
import { join } from "node:path";

const projectRoot = join(import.meta.url, "../..").replace("file:", "")
const robotoUrl500 = join(projectRoot, "node_modules", "@fontsource/roboto/files/roboto-latin-500-normal.woff")
const ubuntuUrl700 = join(projectRoot, "node_modules", "@fontsource/ubuntu/files/ubuntu-latin-700-normal.woff")

const robotoBuf500 = await readFile(robotoUrl500)
const ubuntuBuf700 = await readFile(ubuntuUrl700)


const locationMarkerWidth = 30
const locationMarkerHeight = locationMarkerWidth * (806.06/476.25)

const KillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" style={{marginTop: 20}} width="60px" height="60px" viewBox="0 0 24 24"><path fill="white" d="M11 2v2.07A8.002 8.002 0 0 0 4.07 11H2v2h2.07A8.002 8.002 0 0 0 11 19.93V22h2v-2.07A8.002 8.002 0 0 0 19.93 13H22v-2h-2.07A8.002 8.002 0 0 0 13 4.07V2m-2 4.08V8h2V6.09c2.5.41 4.5 2.41 4.92 4.91H16v2h1.91c-.41 2.5-2.41 4.5-4.91 4.92V16h-2v1.91C8.5 17.5 6.5 15.5 6.08 13H8v-2H6.09C6.5 8.5 8.5 6.5 11 6.08M12 11a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1Z"></path></svg>
const DeathIcon = () => <svg xmlns="http://www.w3.org/2000/svg" style={{marginTop: 20}} width="60px" height="60px" viewBox="0 0 24 24"><path fill="white" d="M10 2h4c3.31 0 5 2.69 5 6v10.66C16.88 17.63 15.07 17 12 17s-4.88.63-7 1.66V8c0-3.31 1.69-6 5-6M8 8v1.5h8V8H8m1 4v1.5h6V12H9M3 22v-.69c2.66-1.69 10.23-5.47 18-.06V22H3Z"></path></svg>

function buildFragment(props: Props) {
    return (
        <div tw="flex flex-col w-full h-full justify-center bg-black/50">
            {/** Attacker / Victim Text */}
            <div tw="flex flex-row w-full justify-around">
                {
                    [
                        {
                            name: props.attacker,
                            ship: props.attackerShip
                        },
                        {
                            name: props.victim,
                            ship: props.victimShip
                        }
                    ].map( ({name, ship}, index) => {

                        return <div key={name} tw={"flex flex-col justify-between flex-1 px-6 py-0 m-0" }>
                            
                            <h1 style={{fontFamily: "ubuntu"}} tw={`text-8xl text-white m-0 ${index === 0 ? "self-end" : ""}`}> { index === 0 ? <KillIcon/> : <DeathIcon/> } {name}</h1>
                            {
                                ship && ship.toLowerCase() !== "unknown" && <h2 tw={` text-slate-400 text-2xl m-0 max-w-sm ${index === 0 ? "self-end" : ""}`}>{ship}</h2>
                            }
                        </div>
                    })
                }
            </div>
            {/** System Info (if present) */}
            {
                props.system && props.system.toLowerCase() !== "unknown" &&
                <div tw="flex flex-row justify-center w-full items-center self-end">
                    <svg style={{color: "cyan"}} fill="currentColor" version="1.1" id="Layer_2" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={locationMarkerWidth+"px"} height={locationMarkerHeight+"px"} viewBox="0 0 476.25 806.06" enable-background="new 0 0 476.25 806.06">
                        <polygon points="238.25,-0.11 238.13,0 238,-0.11 "/>
                        <polygon  stroke-miterlimit="10" points="238.12,806.06 238.25,806.39 238,806.36 "/>
                        <path d="M238.13,0L0,211.44l238.12,594.62l238.13-594.62L238.13,0z M238,353.89l-165-147l165-147l165.17,147L238,353.89z"/>
                    </svg>
                    <h2 tw=" ml-6 text-white text-4xl">
                        {props.system}
                    </h2>
                </div>
            }
        </div>
    )
}



export default async function generateVector(props: Props) {
    return await satori(
        buildFragment(props),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: "Roboto",
                    data: robotoBuf500
                }, 
                {
                    name: "Ubuntu",
                    data: ubuntuBuf700
                }
            ]
        }
    )
}