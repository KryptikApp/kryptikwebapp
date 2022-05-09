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


// combines shares to regenerate seed
export const combineShares = function (shares:Buffer[]) {
    // combine original shares
    let combinedOutput = shamir.combine(shares)
    // return hex version of combined shares
    return combinedOutput;
}
