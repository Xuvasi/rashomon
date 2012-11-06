//This object holds references to the various files used by for Rashomon.
//mediaPath and dataPath can be relative or absolute url (external servers are kosher, make sure webm MIME types are correctly set!)
//video files, with names matching the strings in the files array, are expected to be found @ the media path with both .mp4 and .webm suffixes for cross browser support
//json files produced by exifTool (exiftool -a -j -w json ...) are expected to be found inside the dataPath directory

var rashomonManifest = { 
	"mediaPath": "http://metaviddemo01.ucsc.edu/youtube_deface/",
	"dataPath": "metadata/",
	"event": "Dramatization of Campus Funding Cuts Protest, July 26, 2012",
    "files": [
      "2012-07-26_11.14.53",
      "2012-07-26_11.14.37",     
      "IMG_0227",
      "IMG_0263",
      "20120726_111303"
    ]
};
        
