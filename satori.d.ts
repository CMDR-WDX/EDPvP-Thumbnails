import * as React from 'react'
declare module 'react' {
    export interface HTMLAttributes<T> extends React.HTMLAttributes<T>  {
    // We extend all HTML nodes by "tw", which is used by Satori to define Tailwind Classes
        tw?: string
    }
}