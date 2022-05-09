import * as shamir from "shamirs-secret-sharing-ts"

export interface ShamirOptions{
    shares: number,
    threshold: number
}

// create shares from a given secret
export const createShares = function(secret:string, optionsIn?:ShamirOptions):Buffer[]{
    let secretAsBuffer = Buffer.from(secret);
    let options:ShamirOptions = optionsIn?optionsIn:{shares:2, threshold:2};
    var shares:Buffer[] = shamir.split(secretAsBuffer, options)
    return shares;
}


// combines shares to recover secret
export const combineShares = function (shares:Buffer[]|string[]):Buffer {
    // combine original shares
    let combinedOutput:Buffer = shamir.combine(shares)
    return combinedOutput;
}
