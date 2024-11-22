// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// data:image/svg+xml;base64,
contract DynamicSvgNft is ERC721 {
    // mint
    // store svg information somewhere
    // some logic to say "show x" or "show y"

    uint256 private s_tokenCounter;
    string private s_lowImageUri;
    string private s_highImageUri;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenToHighValue;

    event CreatedNft(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        s_lowImageUri = svgToImageURI(lowSvg);
        s_highImageUri = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // 将svg字符串转换为图像URI
    function svgToImageURI(string memory svg) public pure returns (string memory) {
        // 将svg字符串转换为字节数组
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        // 返回图像URI，包括base64编码的svg字符串和前缀
        return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public payable {
        s_tokenToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
        emit CreatedNft(s_tokenCounter, highValue);
    }

    // 返回NFT的URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exsits(tokenId), "URI query for nonexistent token");
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_lowImageUri;
        if (price >= s_tokenToHighValue[tokenId]) {
            imageURI = s_highImageUri;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    // 返回NFT的baseURI
    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    // 检查NFT是否存在
    function _exsits(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function getLowSVG() public view returns (string memory) {
        return s_lowImageUri;
    }

    function getHighSVG() public view returns (string memory) {
        return s_highImageUri;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
