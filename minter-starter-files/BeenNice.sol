// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/Strings.sol";
import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";

contract BeenNice is ERC721URIStorage {
    using SafeMath for uint256;

    address proxyRegistryAddress;
    uint256 private currentTokenId;
    mapping (uint256 => string) customURI;
    
    function contractURI() public pure returns (string memory) {
        return "https://gateway.pinata.cloud/ipfs/Qmbf22Jbm9w6U5M5WzKCMQNQ9BB7Z7FHxxUjc1wwzsNgN8";
    }

    constructor() ERC721("Juicy Fruit Collection", "JFC") {
    }
    
    function mintTo(address _t, string memory u) public { 
        uint256 n = currentTokenId.add(1);
        _safeMint(_t, n);
        customURI[n] = u;
        currentTokenId++;
    }

    function tokenURI(uint256 _tid) override public view returns (string memory) { 
        return customURI[_tid];
    }
}