let erc20Abi:string[] = [
    // Some details about the token
    "function name() view returns (string)",
    "function symbol() view returns (string)",
  
    // Get the account balance
    "function balanceOf(address) view returns (uint)",
  
    // Send some of your tokens to someone else
    "function transfer(address to, uint amount)",

    // How many tokens spender is allowed to spend on your behalf
    "function allowance(address owner, address spender) view returns (uint)",
    
    // Sets amount as the allowance of spender over the caller’s tokens.
    "function approve(address spender, uint amount) returns (bool)",

    // Sets amount as the allowance of spender over the caller’s tokens.
    "function increaseAllowance(address spender, uint amount) returns (bool)",
  
    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ];

export{erc20Abi}