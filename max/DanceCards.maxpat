{
 "patcher": {
  "fileversion": 1,
  "appversion": {
   "major": 8,
   "minor": 6,
   "revision": 0,
   "architecture": "x64",
   "modernui": 1
  },
  "classnamespace": "box",
  "rect": [
   40,
   60,
   1060,
   1000
  ],
  "openinpresentation": 0,
  "default_fontsize": 12.0,
  "default_fontname": "Arial",
  "gridsize": [
   15.0,
   15.0
  ],
  "boxes": [
   {
    "box": {
     "id": "title",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      20,
      10,
      900,
      26
     ],
     "text": "DANCE CARDS \u2014 webcam dance game (MediaPipe tracking runs inside jweb, fully offline)",
     "fontsize": 18.0,
     "fontface": 1
    }
   },
   {
    "box": {
     "id": "c1",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      20,
      38,
      900,
      40
     ],
     "text": "1. Open this patch. The web page starts by itself. 2. Allow the camera. 3. Swipe a hand in front of the camera. Double-click [noteout] to choose a synth / your DAW. Put your soundscape in the ambient folder as ambient.wav."
    }
   },
   {
    "box": {
     "id": "node",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      20,
      90,
      300,
      22
     ],
     "text": "node.script server.js @autostart 1 @watch 0",
     "outlettype": [
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "rnode",
     "maxclass": "newobj",
     "numinlets": 3,
     "numoutlets": 3,
     "patching_rect": [
      20,
      120,
      160,
      22
     ],
     "text": "route url ambientpath",
     "outlettype": [
      "",
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "preurl",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      20,
      150,
      90,
      22
     ],
     "text": "prepend url",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "reload",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      130,
      150,
      60,
      22
     ],
     "text": "reload",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "jweb",
     "maxclass": "jweb",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      20,
      190,
      640,
      360
     ],
     "outlettype": [
      "",
      ""
     ],
     "rendermode": 1
    }
   },
   {
    "box": {
     "id": "cin",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      680,
      190,
      300,
      22
     ],
     "text": "Control the page from Max (or a MIDI pedal):"
    }
   },
   {
    "box": {
     "id": "m_new",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      680,
      215,
      65,
      22
     ],
     "text": "newcard",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "m_amb",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      760,
      215,
      65,
      22
     ],
     "text": "ambient",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "m_i1",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      680,
      245,
      128,
      22
     ],
     "text": "instrument synth",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "m_i2",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      800,
      245,
      128,
      22
     ],
     "text": "instrument piano",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "m_i3",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      680,
      275,
      128,
      22
     ],
     "text": "instrument bells",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "m_i4",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      800,
      275,
      128,
      22
     ],
     "text": "instrument drums",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "notein",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 3,
     "patching_rect": [
      680,
      315,
      60,
      22
     ],
     "text": "notein",
     "outlettype": [
      "",
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "strip",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 2,
     "patching_rect": [
      680,
      345,
      70,
      22
     ],
     "text": "stripnote",
     "outlettype": [
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "cped",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      760,
      345,
      260,
      22
     ],
     "text": "\u2190 any MIDI note-on = new card (pedal / pad)"
    }
   },
   {
    "box": {
     "id": "route",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 11,
     "patching_rect": [
      20,
      570,
      560,
      22
     ],
     "text": "route notes program reverb bright drum ambient card chord state energy",
     "outlettype": [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "tll",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      20,
      610,
      50,
      22
     ],
     "text": "t l l",
     "outlettype": [
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "sl1",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 2,
     "patching_rect": [
      20,
      650,
      70,
      22
     ],
     "text": "zl.slice 1",
     "outlettype": [
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "sl2",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 2,
     "patching_rect": [
      110,
      650,
      70,
      22
     ],
     "text": "zl.slice 1",
     "outlettype": [
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "iter",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      20,
      680,
      40,
      22
     ],
     "text": "iter",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "mk",
     "maxclass": "newobj",
     "numinlets": 3,
     "numoutlets": 2,
     "patching_rect": [
      20,
      720,
      120,
      22
     ],
     "text": "makenote 100 2500",
     "outlettype": [
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "nout",
     "maxclass": "newobj",
     "numinlets": 3,
     "numoutlets": 0,
     "patching_rect": [
      20,
      760,
      70,
      22
     ],
     "text": "noteout 1"
    }
   },
   {
    "box": {
     "id": "cn",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      20,
      785,
      130,
      22
     ],
     "text": "chords (channel 1)"
    }
   },
   {
    "box": {
     "id": "pgm",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 0,
     "patching_rect": [
      160,
      760,
      70,
      22
     ],
     "text": "pgmout 1"
    }
   },
   {
    "box": {
     "id": "cp",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      160,
      785,
      160,
      22
     ],
     "text": "instrument (GM program)"
    }
   },
   {
    "box": {
     "id": "rv1",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      250,
      680,
      50,
      22
     ],
     "text": "* 127.",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "rv2",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      250,
      710,
      30,
      22
     ],
     "text": "i",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "rv3",
     "maxclass": "newobj",
     "numinlets": 3,
     "numoutlets": 0,
     "patching_rect": [
      250,
      760,
      80,
      22
     ],
     "text": "ctlout 91 1"
    }
   },
   {
    "box": {
     "id": "br1",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      340,
      680,
      50,
      22
     ],
     "text": "* 127.",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "br2",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      340,
      710,
      30,
      22
     ],
     "text": "i",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "br3",
     "maxclass": "newobj",
     "numinlets": 3,
     "numoutlets": 0,
     "patching_rect": [
      340,
      760,
      80,
      22
     ],
     "text": "ctlout 74 1"
    }
   },
   {
    "box": {
     "id": "crv",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      250,
      785,
      200,
      22
     ],
     "text": "reverb CC91 / brightness CC74"
    }
   },
   {
    "box": {
     "id": "dun",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      440,
      680,
      80,
      22
     ],
     "text": "unpack 0 0",
     "outlettype": [
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "dmk",
     "maxclass": "newobj",
     "numinlets": 3,
     "numoutlets": 2,
     "patching_rect": [
      440,
      720,
      120,
      22
     ],
     "text": "makenote 100 200",
     "outlettype": [
      "",
      ""
     ]
    }
   },
   {
    "box": {
     "id": "dout",
     "maxclass": "newobj",
     "numinlets": 3,
     "numoutlets": 0,
     "patching_rect": [
      440,
      760,
      80,
      22
     ],
     "text": "noteout 10"
    }
   },
   {
    "box": {
     "id": "cd",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      440,
      785,
      150,
      22
     ],
     "text": "drums (GM channel 10)"
    }
   },
   {
    "box": {
     "id": "ca",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      640,
      610,
      200,
      22
     ],
     "text": "AMBIENT SOUNDSCAPE",
     "fontface": 1
    }
   },
   {
    "box": {
     "id": "amtog",
     "maxclass": "toggle",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      640,
      635,
      24,
      24
     ],
     "outlettype": [
      "int"
     ]
    }
   },
   {
    "box": {
     "id": "amopen",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      680,
      635,
      60,
      22
     ],
     "text": "open",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "lb",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      740,
      635,
      70,
      22
     ],
     "text": "loadbang",
     "outlettype": [
      "bang"
     ]
    }
   },
   {
    "box": {
     "id": "loop",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      740,
      665,
      60,
      22
     ],
     "text": "loop 1",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "preopen",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      820,
      665,
      90,
      22
     ],
     "text": "prepend open",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "sfp",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 3,
     "patching_rect": [
      640,
      700,
      120,
      22
     ],
     "text": "sfplay~ 2",
     "outlettype": [
      "signal",
      "signal",
      "bang"
     ]
    }
   },
   {
    "box": {
     "id": "g1",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      640,
      735,
      55,
      22
     ],
     "text": "*~ 0.6",
     "outlettype": [
      "signal"
     ]
    }
   },
   {
    "box": {
     "id": "g2",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      705,
      735,
      55,
      22
     ],
     "text": "*~ 0.6",
     "outlettype": [
      "signal"
     ]
    }
   },
   {
    "box": {
     "id": "vol",
     "maxclass": "flonum",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      780,
      700,
      50,
      22
     ],
     "outlettype": [
      "",
      "bang"
     ],
     "minimum": 0.0,
     "maximum": 1.0
    }
   },
   {
    "box": {
     "id": "lm",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      780,
      670,
      85,
      22
     ],
     "text": "loadmess 0.6",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "cv",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      835,
      700,
      60,
      22
     ],
     "text": "volume"
    }
   },
   {
    "box": {
     "id": "dac",
     "maxclass": "ezdac~",
     "numinlets": 2,
     "numoutlets": 0,
     "patching_rect": [
      640,
      770,
      45,
      45
     ]
    }
   },
   {
    "box": {
     "id": "dsp",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      740,
      780,
      93,
      22
     ],
     "text": "; dsp start",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "cdisp",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      20,
      850,
      600,
      22
     ],
     "text": "WHAT THE PAGE SENDS (use these anywhere: [send], OSC, Jitter visuals\u2026)",
     "fontface": 1
    }
   },
   {
    "box": {
     "id": "pcard",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      20,
      880,
      80,
      22
     ],
     "text": "prepend set",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "dcard",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      20,
      910,
      600,
      22
     ],
     "text": "",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "lcard",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      625,
      910,
      50,
      22
     ],
     "text": "card"
    }
   },
   {
    "box": {
     "id": "pchord",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      20,
      945,
      80,
      22
     ],
     "text": "prepend set",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "dchord",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      20,
      975,
      160,
      22
     ],
     "text": "",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "pstate",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      200,
      945,
      80,
      22
     ],
     "text": "prepend set",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "dstate",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "patching_rect": [
      200,
      975,
      120,
      22
     ],
     "text": "",
     "outlettype": [
      ""
     ]
    }
   },
   {
    "box": {
     "id": "energy",
     "maxclass": "flonum",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      340,
      975,
      60,
      22
     ],
     "outlettype": [
      "",
      "bang"
     ]
    }
   },
   {
    "box": {
     "id": "le",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      410,
      975,
      200,
      22
     ],
     "text": "chord \u00b7 state \u00b7 energy 0\u20131"
    }
   },
   {
    "box": {
     "id": "sends",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      340,
      1010,
      110,
      22
     ],
     "text": "send dc_energy"
    }
   },
   {
    "box": {
     "id": "pr",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      600,
      600,
      110,
      22
     ],
     "text": "print dancecards"
    }
   }
  ],
  "lines": [
   {
    "patchline": {
     "source": [
      "reload",
      0
     ],
     "destination": [
      "jweb",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "m_new",
      0
     ],
     "destination": [
      "jweb",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "m_amb",
      0
     ],
     "destination": [
      "jweb",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "m_i1",
      0
     ],
     "destination": [
      "jweb",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "m_i2",
      0
     ],
     "destination": [
      "jweb",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "m_i3",
      0
     ],
     "destination": [
      "jweb",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "m_i4",
      0
     ],
     "destination": [
      "jweb",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "node",
      0
     ],
     "destination": [
      "rnode",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "rnode",
      0
     ],
     "destination": [
      "preurl",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "preurl",
      0
     ],
     "destination": [
      "jweb",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "notein",
      0
     ],
     "destination": [
      "strip",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "notein",
      1
     ],
     "destination": [
      "strip",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "strip",
      0
     ],
     "destination": [
      "m_new",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "jweb",
      0
     ],
     "destination": [
      "route",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      0
     ],
     "destination": [
      "tll",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "tll",
      1
     ],
     "destination": [
      "sl2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sl2",
      0
     ],
     "destination": [
      "mk",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "tll",
      0
     ],
     "destination": [
      "sl1",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sl1",
      1
     ],
     "destination": [
      "iter",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "iter",
      0
     ],
     "destination": [
      "mk",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "mk",
      0
     ],
     "destination": [
      "nout",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "mk",
      1
     ],
     "destination": [
      "nout",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      1
     ],
     "destination": [
      "pgm",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      2
     ],
     "destination": [
      "rv1",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "rv1",
      0
     ],
     "destination": [
      "rv2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "rv2",
      0
     ],
     "destination": [
      "rv3",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      3
     ],
     "destination": [
      "br1",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "br1",
      0
     ],
     "destination": [
      "br2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "br2",
      0
     ],
     "destination": [
      "br3",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      4
     ],
     "destination": [
      "dun",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "dun",
      1
     ],
     "destination": [
      "dmk",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "dun",
      0
     ],
     "destination": [
      "dmk",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "dmk",
      0
     ],
     "destination": [
      "dout",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "dmk",
      1
     ],
     "destination": [
      "dout",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      5
     ],
     "destination": [
      "amtog",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "amtog",
      0
     ],
     "destination": [
      "sfp",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "amopen",
      0
     ],
     "destination": [
      "sfp",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lb",
      0
     ],
     "destination": [
      "loop",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "loop",
      0
     ],
     "destination": [
      "sfp",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lb",
      0
     ],
     "destination": [
      "dsp",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "rnode",
      1
     ],
     "destination": [
      "preopen",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "preopen",
      0
     ],
     "destination": [
      "sfp",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sfp",
      0
     ],
     "destination": [
      "g1",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "sfp",
      1
     ],
     "destination": [
      "g2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "lm",
      0
     ],
     "destination": [
      "vol",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "vol",
      0
     ],
     "destination": [
      "g1",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "vol",
      0
     ],
     "destination": [
      "g2",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "g1",
      0
     ],
     "destination": [
      "dac",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "g2",
      0
     ],
     "destination": [
      "dac",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      6
     ],
     "destination": [
      "pcard",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "pcard",
      0
     ],
     "destination": [
      "dcard",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      7
     ],
     "destination": [
      "pchord",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "pchord",
      0
     ],
     "destination": [
      "dchord",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      8
     ],
     "destination": [
      "pstate",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "pstate",
      0
     ],
     "destination": [
      "dstate",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      9
     ],
     "destination": [
      "energy",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "energy",
      0
     ],
     "destination": [
      "sends",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "route",
      10
     ],
     "destination": [
      "pr",
      0
     ]
    }
   }
  ]
 }
}