/* ==========================================================================
   CRUCIFIED: STORY FILE
   --------------------------------------------------------------------------
   Every word of the game lives in this file. You can change any text between
   quotes "like this" without touching the code.

   Rules for editing safely:
   1. Only change text INSIDE the quotes.
   2. If your text needs a double quote, use a single one ' or write \" instead.
   3. Keep the commas at the end of lines. A missing comma breaks the game.
   4. After editing, refresh the page. If it goes blank, press F12 and the
      Console tab will name the line with the mistake.

   Speakers ("s"): "narrator", "detective", "crowd", or any character id below.
   Moods: "neutral", "scared", "angry", "sad".
   ========================================================================== */

window.STORY = {

  title: "CRUCIFIED",
  subtitle: "A horror detective visual novel about The Crucible",

  settings: {
    hoursPerDay: 6,          // each question costs one hour
    maxReportsPerMeeting: 2, // evidence you can report at each town meeting
    // The hysteria meter can never drop below these floors. It always reaches 100.
    floors: { day1: 10, meeting1: 30, night: 40, day2: 55, meeting2: 75, trial: 100 },
    textSpeed: 22            // milliseconds per letter
  },

  /* ---------------- CRUCIBLE QUOTES (check each against your copy) -------- */
  quotes: {
    accuser:   { text: "Is the accuser always holy now?", cite: "John Proctor, Act 2" },
    vengeance: { text: "We are what we always were in Salem, but now the little crazy children are jangling the keys of the kingdom, and common vengeance writes the law!", cite: "John Proctor, Act 2" },
    court:     { text: "A person is either with this court or he must be counted against it, there be no road between.", cite: "Deputy Governor Danforth, Act 3" },
    name:      { text: "Because it is my name! Because I cannot have another in my life!", cite: "John Proctor, Act 4" },
    life:      { text: "Life, woman, life is God's most precious gift; no principle, however glorious, may justify the taking of it.", cite: "Reverend Hale, Act 4" },
    goodness:  { text: "He have his goodness now. God forbid I take it from him!", cite: "Elizabeth Proctor, Act 4" }
  },

  /* ---------------- MESSAGE TYPES (the "type chart") ---------------------- */
  approaches: {
    kind:       { label: "Kind",       key: "1" },
    direct:     { label: "Direct",     key: "2" },
    intimidate: { label: "Intimidate", key: "3" }
  },
  effectiveness: {
    effective: "Effective! They opened up.",
    neutral:   "Neutral. They gave you a little.",
    weak:      "Not very effective. They shut down.",
    false:     "SUPER effective!! They told you everything you wanted to hear."
  },

  topics: {
    demon: {
      label: "Ask about the demon",
      ask: {
        kind: "Take your time. I'm here to help, not to judge. What do you know about this demon?",
        direct: "Who is the demon? Give me a name.",
        intimidate: "Talk, or the next name I give the court is yours."
      }
    },
    night: {
      label: "Ask about the night of the red light",
      ask: {
        kind: "The night the red light was seen in the woods. Where were you? You can trust me.",
        direct: "Where were you that night? Exactly.",
        intimidate: "Lie to me about that night and you'll hang beside the demon."
      }
    }
  },

  /* ---------------- CHARACTERS ------------------------------------------- */
  // look.style: "hat", "bonnet", "long", "short", "wrap", "wig"
  characters: {

    rarris: {
      name: "Parvend Rarris", basedOn: "Reverend Parris", themes: ["judgment", "fear"],
      look: { robe: "#2b2b33", hair: "#cfc8b8", skin: "#e0b896", style: "hat" },
      card: {
        personality: "The town minister. Proud, nervous, always counting who respects him.",
        motive: "Protect his pulpit and his reputation, whatever it costs.",
        relationships: "Uncle of Wibigail. Master of Abutit. Paid mostly by Pan Nama's family."
      },
      greeting: "Father. Have you found it yet? The town grows impatient. So do I.",
      topics: {
        demon: {
          kind: { eff: "effective", mood: "neutral", lines: [
            "Finally, someone in this town who shows a minister proper respect.",
            "I will be plain with you. I found girls dancing around a fire in the woods. My own niece among them. My servant, too.",
            "If this is called witchcraft, my enemies will say it began in my house. You see my position."
          ], evidence: ["e_dancing"] },
          direct: { eff: "weak", mood: "angry", lines: [
            "How dare you. I sent for a demon hunter, not an auditor.",
            "Look to the Doctor woman's shack in the woods. Respectable people do not live in shacks."
          ], evidence: ["e_rarris_shack"] },
          intimidate: { eff: "false", mood: "scared", lines: [
            "No, no, please! It's... it's Abutit! My servant!",
            "She's from somewhere else. She knows charms. She did this. Not my house. HER."
          ], evidence: ["e_rarris_blames_abutit"] }
        },
        night: {
          kind: { eff: "effective", mood: "sad", lines: [
            "I was writing a sermon when I saw firelight in the trees. I went to look.",
            "Wibigail. Aha. Others. Dancing like heathens. And Abutit stirring a kettle over the fire."
          ], evidence: ["e_kettle_testimony"] },
          direct: { eff: "weak", mood: "angry", lines: [
            "In my study, as I am every night. Ask anyone."
          ], evidence: ["e_rarris_study"] },
          intimidate: { eff: "false", mood: "scared", lines: [
            "I was home! I swear! And I saw... yes, I saw a black shape fly out of the Doctor shack!"
          ], evidence: ["e_rarris_shape"] }
        }
      },
      truth: "Parvend Rarris was a frightened man protecting his pulpit. He sent for you to find a scapegoat. You found him instead."
    },

    wibigail: {
      name: "Wibigail Alam", basedOn: "Abigail Williams", themes: ["accusation", "resentment"],
      look: { robe: "#5a3550", hair: "#7a3b1f", skin: "#f0c9a5", style: "long" },
      card: {
        personality: "Sharp, charming, and furious underneath. Knows exactly what adults want to hear.",
        motive: "Revenge on Eliztor Pron, who threw her out of service. She wants Eliztor's place.",
        relationships: "Niece of Rarris. Leader of the girls. HATES Pan Nama, and Pan Nama hates her."
      },
      greeting: "Oh! Father. You frightened me. Everything frightens me now.",
      topics: {
        demon: {
          kind: { eff: "false", mood: "scared", lines: [
            "Oh sir, I'm so frightened. I feel cold fingers on my neck every night.",
            "It's Eliztor Pron. She looks at me like she wants me dead. She sends her spirit to choke me."
          ], evidence: ["e_wib_accuses_eliztor"] },
          direct: { eff: "effective", mood: "angry", lines: [
            "Fine. You want plain? Eliztor Pron threw me out of her house. Out of service. For nothing.",
            "Ask her husband why. Go on. Ask Jroctor why."
          ], evidence: ["e_wib_fired"] },
          intimidate: { eff: "neutral", mood: "angry", lines: [
            "Threaten me? Ha.",
            "Careful, Father. I point a finger and this whole town sees what I see. I could see a demon on you."
          ], evidence: ["e_wib_threat"] }
        },
        night: {
          kind: { eff: "false", mood: "scared", lines: [
            "I was home asleep, I swear it.",
            "But I saw Pan Nama out there. Creeping around the Doctor shack. That old crow."
          ], evidence: ["e_wib_saw_nama"] },
          direct: { eff: "effective", mood: "angry", lines: [
            "...We were dancing. In the woods. It was a game. Abutit made a soup. That's all.",
            "And Pan Nama paid us to go. She wanted a charm to find out why her babies keep dying. Write THAT down."
          ], evidence: ["e_wib_dance_confession", "e_nama_paid"] },
          intimidate: { eff: "neutral", mood: "angry", lines: [
            "Where was I? Where were YOU, priest? You came awfully fast for a man who lives three days away."
          ], evidence: [] }
        }
      },
      truth: "Wibigail Alam was a hurt, angry girl who learned that an accusation was the only power she had. She was not a demon. She was this town's best student."
    },

    jroctor: {
      name: "Jroctor Pron", basedOn: "John Proctor", themes: ["shame"],
      look: { robe: "#4a3a2a", hair: "#3b2a1a", skin: "#d9a77e", style: "short" },
      card: {
        personality: "A blunt farmer who hates hypocrites, including the one in his mirror.",
        motive: "Hide a past sin. He knows the accusations are lies, but saying how would shame him.",
        relationships: "Husband of Eliztor. Once had an affair with Wibigail."
      },
      greeting: "Another man of God come to save us. Say what you came to say. I have fields to work.",
      topics: {
        demon: {
          kind: { eff: "neutral", mood: "neutral", lines: [
            "Kindness won't make this town less mad, Father.",
            "There's no demon. There's a girl with a grudge and a minister with a pulpit."
          ], evidence: ["e_jroc_no_demon"] },
          direct: { eff: "effective", mood: "sad", lines: [
            "You want it straight? Wibigail Alam is lying. I know it for certain.",
            "...How I know is my business."
          ], evidence: ["e_jroc_knows_wib_lies"] },
          intimidate: { eff: "weak", mood: "angry", lines: [
            "Threaten me on my own land? Get off my field before I throw you off it."
          ], evidence: [] }
        },
        night: {
          kind: { eff: "neutral", mood: "neutral", lines: [
            "I was at the inn. Ask Rarris's girl, Berity. She watches the road from her window all night."
          ], evidence: ["e_jroc_inn"] },
          direct: { eff: "effective", mood: "sad", lines: [
            "...I left the inn near midnight. I went to the woods to tell Wibigail it was over.",
            "I sinned with her. Once. It is done, and my wife knows.",
            "Don't write that in your little book."
          ], evidence: ["e_affair"] },
          intimidate: { eff: "weak", mood: "angry",
            ask: "Sign this statement saying you saw the demon, or I write YOUR name instead.",
            lines: [
              "Sign a lie so you can nail it to the church door? No.",
              "Because it is my name! Because I cannot have another in my life!"
            ], quote: "name", evidence: ["e_jroc_refused"] }
        }
      },
      truth: "Jroctor Pron's only crime was a sin he had already confessed to his wife. He would not sign a lie, even to save himself."
    },

    eliztor: {
      name: "Eliztor Pron", basedOn: "Elizabeth Proctor", themes: ["judgment"],
      look: { robe: "#3a4a5a", hair: "#e8e2d0", skin: "#e8c19c", style: "bonnet" },
      card: {
        personality: "Honest, cold, careful with every word. She has never told a lie.",
        motive: "Keep her family together, even if it means judging her husband in silence.",
        relationships: "Wife of Jroctor. Dismissed Wibigail from service."
      },
      greeting: "Good day, Father. Wipe your boots, please.",
      topics: {
        demon: {
          kind: { eff: "effective", mood: "sad", lines: [
            "There is no demon in this town. There is fear, and there is my husband's shame.",
            "I dismissed Wibigail from our house. I had my reasons. She has hated me since."
          ], evidence: ["e_eliz_fired_wib"] },
          direct: { eff: "neutral", mood: "neutral", lines: [
            "I do not judge my neighbors. God does that.",
            "But since you ask: Parvend Rarris fears for his pulpit more than he fears for any soul."
          ], evidence: ["e_eliz_rarris"] },
          intimidate: { eff: "false", mood: "scared", lines: [
            "My husband? He... he is a good man.",
            "He was home with me that night. All night. I swear it."
          ], evidence: ["e_eliz_alibi"] }
        },
        night: {
          kind: { eff: "effective", mood: "sad", lines: [
            "Jroctor was not home. He came back after midnight, smelling of woodsmoke.",
            "I did not ask him where. I think I know."
          ], evidence: ["e_eliz_woodsmoke"] },
          direct: { eff: "neutral", mood: "neutral", lines: [
            "I was home. With the children. Alone."
          ], evidence: ["e_eliz_home"] },
          intimidate: { eff: "false", mood: "scared", lines: [
            "He was home! With me! I swear it on my children!"
          ], evidence: ["e_eliz_alibi"] }
        }
      },
      truth: "Eliztor Pron told one lie in her whole life, to protect her husband. It was the only thing she said that the court believed."
    },

    abutit: {
      name: "Abutit", basedOn: "Tituba", themes: ["fear"],
      look: { robe: "#8a6a3a", hair: "#c47a2c", skin: "#6b4630", style: "wrap" },
      card: {
        personality: "Quiet and watchful. The only person in town who wasn't born here.",
        motive: "Survive. She knows who gets blamed first in a frightened town.",
        relationships: "Servant in Rarris's house. The girls came to her for charms."
      },
      greeting: "...Yes, Father? I have done nothing. I only clean the Parvend's house.",
      topics: {
        demon: {
          kind: { eff: "effective", mood: "sad", lines: [
            "You... you are the first to speak gently to me here.",
            "There is no demon. The girls asked me for a love charm and a fortune. I made a soup of herbs. That is all. I am not a witch."
          ], evidence: ["e_abutit_charm"] },
          direct: { eff: "neutral", mood: "scared", lines: [
            "I know nothing. I am only a servant. Please, ask the Parvend."
          ], evidence: [] },
          intimidate: { eff: "false", mood: "scared", lines: [
            "Please! Don't hang me!",
            "Yes... yes! I saw the Devil! He came to me with... with Cebeca Doctor! And Eliztor Pron! He told me to hurt the children!",
            "...Is that what you want? I will say anything. Please."
          ], evidence: ["e_abutit_confession"] }
        },
        night: {
          kind: { eff: "effective", mood: "sad", lines: [
            "I was at the fire in the woods. Pan Nama sent her daughter to ask the dead why her babies die.",
            "I put a chicken's blood in the pot. It is an old custom where I come from. It is not evil."
          ], evidence: ["e_chicken_blood"] },
          direct: { eff: "neutral", mood: "scared", lines: [
            "At the fire. With the girls. Then the Parvend came out of the bushes and I ran."
          ], evidence: ["e_abutit_fire"] },
          intimidate: { eff: "false", mood: "scared", lines: [
            "The Devil flew over the fire! Black wings! Wibigail saw it too! Ask her!"
          ], evidence: ["e_abutit_devil_fire"] }
        }
      },
      truth: "Abutit made a pot of soup and a charm, the way her grandmother taught her. She was blamed because she was the one person nobody would defend."
    },

    pannama: {
      name: "Pan Nama", basedOn: "Ann Putnam", themes: ["grudges"],
      look: { robe: "#3d2a3a", hair: "#bfb8a8", skin: "#e6c0a0", style: "bonnet" },
      card: {
        personality: "Rich, grieving, and bitter. Her family pays most of the minister's salary.",
        motive: "Someone must be blamed for her dead children. Cebeca Doctor's land would be a bonus.",
        relationships: "Long feud with Cebeca Doctor over land. HATES Wibigail, and Wibigail hates her."
      },
      greeting: "So you're the demon hunter. You look younger than I expected. And poorer.",
      topics: {
        demon: {
          kind: { eff: "effective", mood: "sad", lines: [
            "Seven babies I've buried. Seven. And Cebeca Doctor's grandchildren are all alive and fat.",
            "Someone is stealing their life. Cebeca, with her herbs out in the woods."
          ], evidence: ["e_nama_babies", "e_nama_accuses_cebeca"] },
          direct: { eff: "weak", mood: "angry", lines: [
            "What is this, an interrogation? My husband pays half this parish.",
            "You want a demon? Look at that Alam girl. Dancing half naked in the woods at night."
          ], evidence: ["e_nama_accuses_wib"] },
          intimidate: { eff: "neutral", mood: "angry", lines: [
            "You threaten ME? Do you know whose land you're standing on?",
            "Cebeca Doctor's land borders ours. She's cut wood from our side for twenty years. Write that down."
          ], evidence: ["e_land_dispute"] }
        },
        night: {
          kind: { eff: "effective", mood: "sad", lines: [
            "...I sent my daughter to Abutit. To ask the dead why my babies die.",
            "Is that a sin? I'm their mother."
          ], evidence: ["e_nama_sent_daughter"] },
          direct: { eff: "weak", mood: "angry", lines: [
            "Home. In bed. Next question."
          ], evidence: [] },
          intimidate: { eff: "neutral", mood: "angry", lines: [
            "I saw that Alam girl at the shack with a man. A married man. Ask HER where she was."
          ], evidence: ["e_nama_saw_wib_man"] }
        }
      },
      truth: "Pan Nama buried seven children and needed someone to blame. Now her last child has no mother."
    },

    cebeca: {
      name: "Cebeca Doctor", basedOn: "Rebecca Nurse", themes: ["the innocent"],
      look: { robe: "#556b4a", hair: "#f0ece0", skin: "#e3c3a6", style: "bonnet" },
      card: {
        personality: "Seventy-two years old, gentle, and unafraid. Everyone calls her a saint, until now.",
        motive: "None. She has nothing to hide except a garden.",
        relationships: "Pan Nama has wanted her land for twenty years."
      },
      greeting: "Come in out of the wind, Father. Sit. You look like you haven't slept.",
      topics: {
        demon: {
          kind: { eff: "effective", mood: "neutral", lines: [
            "Thank you for asking gently. Most come only to shout.",
            "I've lived seventy-two years. I've seen this before. A town gets scared, and then it needs a name."
          ], evidence: ["e_cebeca_wisdom"] },
          direct: { eff: "effective", mood: "neutral", lines: [
            "I don't believe there is a demon, Father. And I'd be careful of anyone who's certain there is.",
            "That includes you."
          ], evidence: ["e_cebeca_wisdom"] },
          intimidate: { eff: "neutral", mood: "sad", lines: [
            "You can frighten me. You can't make me lie.",
            "I won't confess to something I haven't done. Not even to make you go away."
          ], evidence: ["e_cebeca_refuses"] }
        },
        night: {
          kind: { eff: "effective", mood: "sad", lines: [
            "I was at my garden behind the old shack. I grow medicine there: feverfew, willow bark.",
            "Parvend Rarris preaches that herbs are witchcraft, so I keep it hidden.",
            "I tried to save Pan Nama's last baby. I couldn't."
          ], evidence: ["e_cebeca_garden"] },
          direct: { eff: "effective", mood: "neutral", lines: [
            "At the shack. I tend the herbs at night so no one sees.",
            "I use a lantern with red glass so the light doesn't carry. I suppose it carried anyway."
          ], evidence: ["e_red_lantern"] },
          intimidate: { eff: "neutral", mood: "sad", lines: [
            "At my garden. Which I'm sure you'll write down as proof of something."
          ], evidence: ["e_cebeca_garden"] }
        }
      },
      truth: "Cebeca Doctor spent thirty years secretly keeping this town alive with willow bark and feverfew. Her garden behind the shack died that winter. So did four children with fevers."
    },

    berity: {
      name: "Parvend Berity", basedOn: "Betty Parris", themes: ["paranoia"],
      look: { robe: "#4a5a6a", hair: "#3a2a1a", skin: "#efcfb0", style: "long" },
      card: {
        personality: "Rarris's ten-year-old daughter. She 'fell sick' after the dancing and won't leave her room, but she watches everything from her window.",
        motive: "Stay 'sick' so nobody asks what she did in the woods. She's sure everyone is talking about her.",
        relationships: "Daughter of Rarris, cousin of Wibigail. She was at the fire."
      },
      greeting: "Who told you I was awake? ...Don't tell Father. Sit there, where I can see you.",
      topics: {
        demon: {
          kind: { eff: "neutral", mood: "scared", lines: [
            "Why are you being nice to me? What did Wibigail tell you? Is everyone talking about me?",
            "...Fine. I keep a list. Everyone who looks at me wrong. It's a long list."
          ], evidence: ["e_berity_list"] },
          direct: { eff: "effective", mood: "neutral", lines: [
            "Okay. I'll tell you one true thing.",
            "From my window I can see the woods. I've watched that shack for a week. Red light every night. The only one I ever saw go in was old Cebeca, carrying a basket."
          ], evidence: ["e_berity_cebeca_basket"] },
          intimidate: { eff: "false", mood: "scared", lines: [
            "Everyone! It's everyone! Rarris, Nama, the Prons, the girls...",
            "They all whisper about me! All of them!"
          ], evidence: ["e_berity_everyone"] }
        },
        night: {
          kind: { eff: "neutral", mood: "scared", lines: [
            "At my window. Watching. Jroctor Pron left the inn near midnight. He thought nobody saw. I see everything."
          ], evidence: ["e_jroc_left_inn"] },
          direct: { eff: "effective", mood: "neutral", lines: [
            "At my window, across from the inn. Here is the order:",
            "Jroctor left at midnight toward the woods. Wibigail came out of the woods after him, crying. Then Rarris ran up the road with a lantern."
          ], evidence: ["e_berity_timeline"] },
          intimidate: { eff: "false", mood: "scared", lines: [
            "I saw shapes! Shadows! A dozen of them, with horns, dancing!"
          ], evidence: ["e_berity_shadows"] }
        }
      },
      truth: "Berity was ten. She pretended to be sick because she was scared of getting in trouble. In the end she was right that everyone was watching her."
    },

    reversa: {
      name: "Aha Reversa", basedOn: "(group to confirm)", themes: ["hysteria"],
      look: { robe: "#7a6a8a", hair: "#c9a050", skin: "#f2cfae", style: "long" },
      card: {
        personality: "Sixteen, jumpy, desperate to belong. Screams first, thinks later.",
        motive: "Stay on Wibigail's good side. Being one of the 'afflicted' is safer than being accused.",
        relationships: "One of the girls who danced in the woods. Terrified of Wibigail."
      },
      greeting: "Is she watching? Wibigail? ...Okay. Okay. Hi.",
      topics: {
        demon: {
          kind: { eff: "effective", mood: "scared", lines: [
            "...You won't tell Wibigail I talked to you? She said if any of us tells, she'll come in the night.",
            "We weren't doing magic. We were dancing. Wibigail said if we got caught, we should scream about spirits."
          ], evidence: ["e_reversa_plan"] },
          direct: { eff: "weak", mood: "scared", lines: [
            "I... I don't... there's a bird! A yellow bird on the beam! Don't you see it?!"
          ], evidence: ["e_reversa_bird"] },
          intimidate: { eff: "false", mood: "scared", lines: [
            "AAAH! She's choking me! Cebeca Doctor's spirit! She's HERE!"
          ], evidence: ["e_reversa_fit"] }
        },
        night: {
          kind: { eff: "effective", mood: "sad", lines: [
            "We danced around Abutit's fire. Then Parvend Rarris jumped out of the bushes and everyone ran.",
            "Wibigail said: tomorrow, we say we were bewitched."
          ], evidence: ["e_reversa_ran"] },
          direct: { eff: "weak", mood: "scared", lines: [
            "I can't remember. I can't! My head hurts!"
          ], evidence: [] },
          intimidate: { eff: "false", mood: "scared", lines: [
            "I saw the Devil in the fire! He had... he had YOUR face!"
          ], evidence: ["e_reversa_your_face"] }
        }
      },
      truth: "Aha Reversa was sixteen. She screamed because Wibigail told her to, and because screaming was safer than the truth."
    },

    /* Characters that appear in scenes but can't be interviewed */
    fanforth: {
      name: "Judge Fanforth", basedOn: "Deputy Governor Danforth", themes: ["judgment"], noInterview: true,
      look: { robe: "#5a1a1a", hair: "#f2f0ea", skin: "#e0b896", style: "wig" }
    },
    detective: {
      name: "You", basedOn: "", themes: [], noInterview: true,
      look: { robe: "#141118", hair: "#2a1d14", skin: "#d8b08c", style: "hat" }
    }
  },

  /* ---------------- MAP ----------------------------------------------------
     x and y are positions on the town map, in percent. */
  locations: [
    { id: "church",  name: "Church",          bg: "church",  x: 50, y: 30, people: ["rarris", "abutit"] },
    { id: "inn",     name: "Parsonage",       bg: "house",     x: 20, y: 48, people: ["berity"] },
    { id: "farm",    name: "Pron Farm",       bg: "farm",    x: 82, y: 50, people: ["jroctor", "eliztor"] },
    { id: "square",  name: "Town Square",     bg: "square",  x: 45, y: 62, people: ["wibigail", "reversa"] },
    { id: "nama",    name: "Nama House",      bg: "house",   x: 72, y: 30, people: ["pannama"] },
    { id: "cottage", name: "Doctor Cottage",  bg: "cottage", x: 14, y: 26, people: ["cebeca"] }
  ],

  /* ---------------- EVIDENCE ----------------------------------------------
     type: "fact", "testimony", or "inference".
     shocking: true means reporting it makes hysteria spike.
     report: how much hysteria changes if you report it at a town meeting
     (leave it out to use the default for its type). */
  defaultReport: {
    fact:      { d: -5, line: "The crowd murmurs. A few people nod slowly." },
    testimony: { d: 6,  line: "Whispers spread through the pews. Somebody repeats it louder." },
    shocking:  { d: 15, line: "Someone screams. A mother drags her children out of the church." },
    inference: { d: -7, line: "A few people look ashamed. Most just look annoyed." }
  },

  evidence: {
    e_letter_fact: { type: "fact", from: "Your summons", text: "An unsigned letter called you here. It carries the seal of this parish." },
    e_shops_3pm: { type: "fact", from: "Observation", text: "The shops close at 3 pm. After dark, the streets are empty." },

    e_dancing: { type: "testimony", from: "Rarris", text: "Rarris found girls dancing around a fire in the woods, including his niece Wibigail and his servant Abutit." },
    e_rarris_shack: { type: "testimony", from: "Rarris", text: "Rarris: look at Cebeca Doctor's shack. 'Respectable people do not live in shacks.'", report: { d: 8 } },
    e_rarris_blames_abutit: { type: "testimony", from: "Rarris", text: "Under pressure, Rarris blamed his servant Abutit: 'She's from somewhere else.'", report: { d: 9 } },
    e_kettle_testimony: { type: "testimony", from: "Rarris", text: "Rarris saw Abutit stirring a kettle over the fire while the girls danced." },
    e_rarris_study: { type: "testimony", from: "Rarris", text: "Rarris claims he spent the whole night in his study." },
    e_rarris_shape: { type: "testimony", shocking: true, from: "Rarris", text: "Rarris claims he saw a black shape fly out of the Doctor shack.", report: { d: 12 } },

    e_wib_accuses_eliztor: { type: "testimony", from: "Wibigail", text: "Wibigail says Eliztor Pron sends her spirit to choke her at night.", report: { d: 11 } },
    e_wib_fired: { type: "testimony", from: "Wibigail", text: "Wibigail admits Eliztor threw her out of service. 'Ask Jroctor why.'" },
    e_wib_threat: { type: "testimony", from: "Wibigail", text: "Wibigail: 'I point a finger and this whole town sees what I see.'" },
    e_wib_saw_nama: { type: "testimony", from: "Wibigail", text: "Wibigail says Pan Nama was creeping around the Doctor shack that night.", report: { d: 8 } },
    e_wib_dance_confession: { type: "testimony", from: "Wibigail", text: "Wibigail admits the girls were dancing in the woods. 'It was a game.'", report: { d: -3 } },
    e_nama_paid: { type: "testimony", from: "Wibigail", text: "Wibigail says Pan Nama sent the girls to Abutit for a charm." },

    e_jroc_no_demon: { type: "testimony", from: "Jroctor", text: "Jroctor: 'There's no demon. There's a girl with a grudge and a minister with a pulpit.'", report: { d: -4, line: "Jroctor's name is said aloud. A few people glance at him, then look away fast." } },
    e_jroc_knows_wib_lies: { type: "testimony", from: "Jroctor", text: "Jroctor knows 'for certain' that Wibigail is lying, but won't say how." },
    e_jroc_inn: { type: "testimony", from: "Jroctor", text: "Jroctor says he was at the inn that night." },
    e_affair: { type: "testimony", from: "Jroctor", text: "Jroctor confesses he went to the woods at midnight to end an affair with Wibigail.", report: { d: 10, line: "The church erupts. Wibigail faints dramatically. Eliztor doesn't move at all." } },
    e_jroc_refused: { type: "testimony", from: "Jroctor", text: "Jroctor refused to sign a statement saying he saw a demon.", report: { d: 7, line: "'Why won't he sign, unless he's hiding something?'" } },

    e_eliz_fired_wib: { type: "testimony", from: "Eliztor", text: "Eliztor dismissed Wibigail from service. 'She has hated me since.'" },
    e_eliz_rarris: { type: "testimony", from: "Eliztor", text: "Eliztor: Rarris fears for his pulpit more than for any soul." },
    e_eliz_alibi: { type: "testimony", from: "Eliztor", text: "Eliztor swears Jroctor was home with her all night." },
    e_eliz_woodsmoke: { type: "testimony", from: "Eliztor", text: "Eliztor admits Jroctor came home after midnight, smelling of woodsmoke." },
    e_eliz_home: { type: "testimony", from: "Eliztor", text: "Eliztor says she was home alone with the children." },

    e_abutit_charm: { type: "testimony", from: "Abutit", text: "Abutit: the girls asked for a love charm. She made a soup of herbs.", report: { d: -4 } },
    e_abutit_confession: { type: "testimony", shocking: true, from: "Abutit", text: "Abutit 'confessed' that she saw the Devil with Cebeca Doctor and Eliztor Pron.", report: { d: 18, line: "The church goes silent. Then everyone is shouting two names: Doctor and Pron." } },
    e_chicken_blood: { type: "testimony", from: "Abutit", text: "Abutit put a chicken's blood in the pot, an old custom from her home.", report: { d: 6, line: "'BLOOD?' Nobody hears the word 'chicken.'" } },
    e_abutit_fire: { type: "testimony", from: "Abutit", text: "Abutit was at the fire with the girls and ran when Rarris came." },
    e_abutit_devil_fire: { type: "testimony", shocking: true, from: "Abutit", text: "Abutit claims the Devil flew over the fire, and Wibigail saw it too.", report: { d: 15 } },

    e_nama_babies: { type: "testimony", from: "Pan Nama", text: "Pan Nama has buried seven babies. Cebeca Doctor's grandchildren are all alive." },
    e_nama_accuses_cebeca: { type: "testimony", from: "Pan Nama", text: "Pan Nama accuses Cebeca Doctor of stealing her babies' lives with herbs.", report: { d: 11 } },
    e_nama_accuses_wib: { type: "testimony", from: "Pan Nama", text: "Pan Nama accuses Wibigail: 'Dancing half naked in the woods at night.'", report: { d: 8 } },
    e_land_dispute: { type: "testimony", from: "Pan Nama", text: "Cebeca Doctor's land borders Pan Nama's. They have fought over it for twenty years." },
    e_nama_sent_daughter: { type: "testimony", from: "Pan Nama", text: "Pan Nama sent her daughter to Abutit to ask the dead why her babies die." },
    e_nama_saw_wib_man: { type: "testimony", from: "Pan Nama", text: "Pan Nama says she saw Wibigail at the shack with a married man.", report: { d: 9 } },

    e_cebeca_wisdom: { type: "testimony", from: "Cebeca", text: "Cebeca: 'A town gets scared, and then it needs a name.'", report: { d: -6, line: "An old man in the back says 'Amen.' He is the only one." } },
    e_cebeca_refuses: { type: "testimony", from: "Cebeca", text: "Cebeca will not confess to something she didn't do." },
    e_cebeca_garden: { type: "testimony", from: "Cebeca", text: "Cebeca grows medicine in a hidden garden behind the old shack. Rarris calls herbs witchcraft.", report: { d: 8, line: "'Herbs. In the woods. At NIGHT.' The word 'medicine' gets lost." } },
    e_red_lantern: { type: "testimony", from: "Cebeca", text: "Cebeca uses a red-glass lantern at night so the light doesn't carry.", report: { d: -5 } },

    e_berity_list: { type: "testimony", from: "Berity", text: "Berity keeps a list of everyone who 'looks at him wrong.'" },
    e_berity_cebeca_basket: { type: "testimony", from: "Berity", text: "Berity has watched the shack for a week. Only Cebeca goes in, carrying a basket.", report: { d: 7, line: "'So it IS the Doctor woman!' That isn't what you said." } },
    e_berity_everyone: { type: "testimony", shocking: true, from: "Berity", text: "Berity, panicking: 'Everyone! They all whisper about me!'", report: { d: 10 } },
    e_jroc_left_inn: { type: "testimony", from: "Berity", text: "Berity saw Jroctor leave the inn near midnight." },
    e_berity_timeline: { type: "testimony", from: "Berity", text: "Berity's timeline: Jroctor left at midnight toward the woods. Wibigail came out crying. Then Rarris ran up with a lantern." },
    e_berity_shadows: { type: "testimony", shocking: true, from: "Berity", text: "Berity claims he saw a dozen horned shadows dancing.", report: { d: 14 } },

    e_reversa_plan: { type: "testimony", from: "Aha", text: "Aha: 'Wibigail said if we got caught, we should scream about spirits.'", report: { d: -5, line: "Wibigail stares at Aha. Aha bursts into tears and says she made it up." } },
    e_reversa_bird: { type: "testimony", shocking: true, from: "Aha", text: "Aha screamed that a yellow bird was on the beam. You saw nothing.", report: { d: 10 } },
    e_reversa_fit: { type: "testimony", shocking: true, from: "Aha", text: "Aha had a fit, crying that Cebeca Doctor's spirit was choking her.", report: { d: 16 } },
    e_reversa_ran: { type: "testimony", from: "Aha", text: "Aha: they danced, Rarris jumped out, everyone ran. 'Tomorrow, we say we were bewitched.'", report: { d: -4 } },
    e_reversa_your_face: { type: "testimony", shocking: true, from: "Aha", text: "Aha says she saw the Devil in the fire, and he had YOUR face.", report: { d: 8, line: "People turn in the pews to look at you. Just for a second." } },

    e_hallucination_shadow: { type: "testimony", shocking: true, from: "Your own eyes", text: "You saw a horned shadow at the shack window.", report: { d: 12, line: "'The demon hunter has SEEN it!' Now nobody can say it isn't real." } },

    e_herbs: { type: "fact", from: "The shack", text: "Inside the shack: bundles of willow bark, feverfew, and mint drying from the beams." },
    e_lantern_found: { type: "fact", from: "The shack", text: "A lantern with red glass panes, still warm." },
    e_ledger: { type: "fact", from: "The shack", text: "Cebeca's ledger of remedies for 31 families. 'Nama baby. Fever. Willow bark. Could not save him. God keep him.'", report: { d: -8 } },
    e_cats: { type: "fact", from: "The shack", text: "Six black cats live behind the shack. Small, dark, fast shapes.", report: { d: -4, line: "'Black cats. Of course.' A few people laugh. More people don't." } },
    e_kettle_blood: { type: "fact", shocking: true, from: "The clearing", text: "In the clearing: a kettle crusted with dried blood.", report: { d: 16, line: "'BLOOD!' The word travels faster than you can explain it." } },
    e_footprints: { type: "fact", from: "The clearing", text: "Many small footprints circle the fire. Girls' shoes. Dancing." },
    e_ribbon: { type: "fact", from: "The clearing", text: "A torn ribbon by the fire. It matches the one Wibigail wears." },
    e_letter_draft: { type: "fact", from: "Rarris's study", text: "A draft in Rarris's hand: '...we must name a culprit quickly, before talk of my niece's dancing reaches the magistrate.'", report: { d: -6, line: "Rarris goes pale. 'A forgery!' he shouts. Half the room believes him." } },
    e_rarris_debts: { type: "fact", from: "Rarris's study", text: "Rarris's accounts: the parish owes him months of salary. Pan Nama's husband pays most of it." },
    e_wib_letter: { type: "fact", from: "Pron barn", text: "A letter hidden in the Prons' barn: 'You loved me once. If she were gone, you would again. -W.'", report: { d: 4, line: "Wibigail screams that it's a forgery, then faints. It works." } }
  },

  /* ---------------- CONNECTIONS (inferences) -------------------------------
     needs: a list of groups. You need at least ONE piece of evidence from EACH
     group to unlock the connection in your journal. */
  inferences: {
    inf_red_light: { needs: [["e_red_lantern", "e_lantern_found"], ["e_berity_cebeca_basket", "e_cebeca_garden", "e_herbs"]],
      text: "The red glow in the woods is Cebeca's lantern. She is tending medicine, not summoning anything." },
    inf_blood: { needs: [["e_chicken_blood"], ["e_kettle_blood", "e_kettle_testimony"]],
      text: "The blood in the kettle is a chicken's, from Abutit's charm." },
    inf_revenge: { needs: [["e_affair", "e_wib_letter", "e_jroc_knows_wib_lies", "e_berity_timeline"], ["e_wib_fired", "e_eliz_fired_wib", "e_eliz_woodsmoke", "e_wib_accuses_eliztor"]],
      text: "Wibigail accuses Eliztor out of revenge. With Eliztor gone, she thinks she'd have Jroctor." },
    inf_cover: { needs: [["e_reversa_plan", "e_reversa_ran", "e_wib_dance_confession", "e_footprints"], ["e_reversa_bird", "e_reversa_fit", "e_wib_accuses_eliztor", "e_dancing"]],
      text: "The girls' 'fits' are a cover story. They got caught dancing and needed someone else to blame." },
    inf_land: { needs: [["e_land_dispute", "e_rarris_debts"], ["e_nama_accuses_cebeca"]],
      text: "If Cebeca hangs, Pan Nama gets the land she's wanted for twenty years." },
    inf_babies: { needs: [["e_ledger", "e_cebeca_garden"], ["e_nama_babies", "e_nama_accuses_cebeca"]],
      text: "Cebeca tried to save Pan Nama's babies. Pan Nama blames her anyway, because she needs someone to blame." },
    inf_coerced: { needs: [["e_abutit_confession", "e_abutit_devil_fire", "e_berity_everyone", "e_berity_shadows", "e_reversa_fit", "e_rarris_blames_abutit", "e_rarris_shape", "e_eliz_alibi"], ["e_abutit_charm", "e_chicken_blood", "e_berity_cebeca_basket", "e_reversa_plan", "e_eliz_woodsmoke", "e_dancing"]],
      text: "Everyone I frightened told me a different story. Fear doesn't produce truth. It produces whatever the frightened person thinks I want." },
    inf_eyes: { needs: [["e_hallucination_shadow"], ["e_cats", "e_lantern_found", "e_red_lantern"]],
      text: "The horned shape at the window was a cat, a lantern, and my own memory. My eyes are not evidence." },
    inf_letter: { needs: [["e_letter_draft"], ["e_letter_fact"]],
      text: "Rarris sent for me. He needs a culprit named fast so nobody looks at his own household." }
  },

  /* ---------------- SCENES -------------------------------------------------
     Step types: { bg }, { show: [ids] }, { s, t, mood, quote }, { card: { title, quote } },
     { evidence: id }, { hyst: change }, { hystTo: value }, { fx: "red" | "shadow" | "shake" | "toss" },
     { music: "day" | "night" | "trial" | "ending" | "detune" }, { note: presenterKey } */
  scenes: {
    intro: [
      { bg: "memory", music: "night", show: [] },
      { s: "narrator", t: "A night like any other. Then a letter slides under your door, long after midnight." },
      { s: "narrator", t: "No name. Only the wax seal of a small parish three days' ride to the north." },
      { evidence: "e_letter_fact" },
      { s: "narrator", t: "'A demon walks among us. Come quickly. Name it before it takes us all.'" },
      { fx: "red" },
      { show: ["detective"] },
      { s: "detective", t: "I know what a demon looks like. I was seven years old. I saw one standing over my mother and father." },
      { s: "detective", t: "The doctors said I dreamed it. The doctors were wrong. I have hunted them ever since." },
      { note: "intro" },
      { bg: "town_day", music: "day", show: [] },
      { s: "narrator", t: "Three days later you ride into town. A church, an inn, a forge, a few farms. And an old shack in the woods that nobody looks at." },
      { s: "narrator", t: "The shops close at three. People walk fast with their heads down. Nobody meets your eyes." },
      { evidence: "e_shops_3pm" },
      { show: ["rarris"] },
      { s: "rarris", mood: "scared", t: "Father! Thank God. I am Parvend Rarris, the minister here. Somebody sent for you, I'm told." },
      { s: "rarris", mood: "scared", t: "Ask whatever you need. Only... find it quickly. This town will not wait long." },
      { show: [] },
      { s: "narrator", t: "You have two days. Every question takes an hour. Choose who to question, and how to question them." },
      { card: { title: "DAY ONE", quote: "accuser" } }
    ],

    meetingIntro: [
      { bg: "church", music: "trial", show: [] },
      { s: "narrator", t: "Sundown. The whole town has packed into the church. They want to hear what the demon hunter found." },
      { s: "crowd", t: "Tell us! What did you find?! Who is it?!" },
      { note: "meeting" }
    ],
    meetingSilence: [
      { s: "narrator", t: "You say nothing. In this town, silence sounds like guilt." },
      { hyst: 8 }
    ],

    nightIntro: [
      { bg: "town_night", music: "night", show: [] },
      { card: { title: "NIGHT", quote: "vengeance" } },
      { s: "narrator", t: "The streets are empty. Out in the woods, a faint red glow pulses behind the vines on the shack window." },
      { music: "detune" },
      { fx: "shadow" },
      { s: "detective", mood: "scared", t: "There. At the window. Horns. I saw horns." },
      { evidence: "e_hallucination_shadow" },
      { note: "night" },
      { s: "narrator", t: "You have time to search one place before dawn." }
    ],

    nightPlaces: [
      { id: "shack", name: "The shack in the woods", bg: "shack", steps: [
        { s: "narrator", t: "You push through the vines. The door isn't locked. The red light is a lantern with red glass panes, still warm." },
        { evidence: "e_lantern_found" },
        { s: "narrator", t: "Bundles of dried plants hang from every beam. It smells like mint and bitter bark." },
        { evidence: "e_herbs" },
        { s: "narrator", t: "On the table, a ledger. Page after page of names, remedies, and dates, in a careful old hand." },
        { evidence: "e_ledger" },
        { s: "narrator", t: "Something brushes your leg. You nearly scream. It's a black cat. Then another. Six of them, living behind the shack." },
        { evidence: "e_cats" }
      ] },
      { id: "clearing", name: "The clearing with the fire", bg: "clearing", steps: [
        { s: "narrator", t: "A ring of ash in a clearing. Something big was burned here, or cooked." },
        { s: "narrator", t: "A kettle lies on its side. The inside is crusted dark red." },
        { fx: "red" },
        { evidence: "e_kettle_blood" },
        { s: "narrator", t: "Small footprints circle the fire, round and round. Girls' shoes. Dancing." },
        { evidence: "e_footprints" },
        { s: "narrator", t: "Caught on a branch: a torn ribbon. You've seen this color today." },
        { evidence: "e_ribbon" }
      ] },
      { id: "study", name: "Rarris's study", bg: "study", steps: [
        { s: "narrator", t: "The church is dark. Rarris's study door sticks, then gives." },
        { s: "narrator", t: "On the desk, a pile of crumpled drafts. Most say the same thing in different words." },
        { evidence: "e_letter_draft" },
        { s: "narrator", t: "Under them, the parish accounts. Rarris has not been paid in months. One family pays most of what he does get." },
        { evidence: "e_rarris_debts" }
      ] },
      { id: "barn", name: "The Pron barn", bg: "barn", steps: [
        { s: "narrator", t: "The Pron barn smells like hay and cold iron. Through the house window you see Eliztor, awake, praying alone." },
        { s: "narrator", t: "Tucked behind a loose board: a folded letter, read so many times the creases are soft." },
        { evidence: "e_wib_letter" }
      ] }
    ],

    day2Intro: [
      { bg: "town_day", music: "day", show: [] },
      { card: { title: "DAY TWO", quote: "name" } },
      { s: "narrator", t: "Overnight, someone painted a crude mark on Cebeca Doctor's door. Three families have locked their children inside." },
      { fx: "shadow" },
      { s: "detective", mood: "scared", t: "For a moment, the shadow behind the crowd had horns again. Then it was just a woman's bonnet." },
      { s: "narrator", t: "The judge arrives tomorrow at dawn. Whatever you know by then is all you will know." }
    ],

    trialIntro: [
      { bg: "courtroom", music: "trial", show: ["fanforth"] },
      { card: { title: "THE TRIAL", quote: null } },
      { s: "fanforth", t: "I am Judge Fanforth. I have heard this town's complaints since dawn. I am tired, Father." },
      { s: "fanforth", quote: "court", t: "So understand me. A person is either with this court or he must be counted against it, there be no road between." },
      { hystTo: 100 },
      { s: "crowd", t: "NAME IT! NAME THE DEMON!" },
      { note: "trial" },
      { s: "fanforth", t: "You have spoken to all of them. Name the demon." }
    ],

    // Shown when you have made 3+ connections and say there is no demon
    truthSpeech: {
      intro: "You open your journal and lay it out, piece by piece.",
      reply: "Connections. Inferences. How tiresome. This town has already decided, Father. Have you?"
    },

    endingAccuse: {
      title: "ENDING: THE TOWN IS SATISFIED",
      steps: [
        { s: "detective", t: "The demon is {name}." },
        { s: "crowd", t: "WE KNEW IT! WE ALWAYS KNEW!" },
        { s: "fanforth", t: "So be it. {name} will hang at noon." },
        { s: "narrator", t: "The crowd cheers. For the first time since you arrived, people smile at you in the street." }
      ],
      epilogue: [
        { bg: "town_day", music: "night", show: [] },
        { s: "narrator", t: "The truth, which nobody asked for:" },
        { s: "narrator", t: "{truth}" },
        { s: "narrator", t: "A week later, Wibigail faints in church. When she wakes up, she points at someone new." }
      ],
      quote: "life"
    },

    endingNoDemon: {
      title: "ENDING: CRUCIFIED",
      steps: [
        { s: "detective", t: "There is no demon." },
        { s: "fanforth", t: "No demon? Then you deny this court. And a man who is not with this court is counted against it." },
        { show: ["fanforth", "reversa"] },
        { s: "reversa", mood: "scared", t: "HIM! I saw his face in the fire!" },
        { show: ["fanforth", "pannama"] },
        { s: "pannama", mood: "angry", t: "The fits started the day he rode in!" },
        { show: ["fanforth", "wibigail"] },
        { s: "wibigail", mood: "neutral", t: "He brought it with him. He always had it." },
        { show: ["detective"] },
        { s: "detective", t: "I came here to hunt a demon. They needed one. I was the only stranger left." },
        { note: "ending" },
        { s: "narrator", t: "You look down at your folder. Two days of facts, testimony, and connections. Every piece of it true." },
        { music: "ending" },
        { fx: "toss" },
        { s: "narrator", t: "You toss it over your shoulder." },
        { bg: "jail", show: ["detective"] },
        { s: "narrator", t: "The constables drag you to the jail. The charge sheet has one word on it: EVERYTHING." },
        { s: "detective", t: "Worth it." }
      ],
      quote: "accuser"
    },

    // Extra lines if the accused is Jroctor or Eliztor
    accuseExtras: {
      jroctor: [
        { show: ["jroctor"] },
        { s: "jroctor", mood: "angry", t: "They want me to sign a confession for my life. I will not.", },
        { s: "jroctor", mood: "angry", quote: "name", t: "Because it is my name! Because I cannot have another in my life!" },
        { show: ["eliztor"] },
        { s: "eliztor", mood: "sad", quote: "goodness", t: "He have his goodness now. God forbid I take it from him!" }
      ],
      cebeca: [
        { s: "narrator", t: "Within a week, Pan Nama's fence has moved onto the Doctor land." }
      ]
    }
  },

  /* ---------------- PRESENTER MODE NOTES ----------------------------------
     Shown on screen when Presenter Mode is on. Use these for the presentation. */
  presenter: {
    intro: "BACKSTORY: the detective WANTS demons to be real. Like Salem's judges, he arrives already certain. (Theme: judgment)",
    map: "TIME LIMIT: every question costs an hour. Pressure pushes the player to judge fast, like Salem's courts did. (Themes: fear, judgment)",
    approach: "MESSAGE TYPES = rhetorical approaches. Intimidation is labeled 'SUPER effective' but produces false confessions, like Tituba in Act 1. (Themes: fear, accusation)",
    journal: "FACT vs TESTIMONY vs INFERENCE: the player has to judge how credible each source is, which Salem's court refused to do with spectral evidence.",
    meeting: "HYSTERIA METER: calm facts slow it and shocking claims spike it, but its floor keeps rising. Hysteria is a system, not one person's fault. (Theme: hysteria)",
    night: "HALLUCINATIONS: the hunter sees horns because he expects them. He brings the demon with him. (Themes: paranoia, spectral evidence)",
    trial: "THE TRIAL: echoes Danforth. There is no neutral option, and the meter is now 100% no matter what you did. (Themes: judgment, hysteria)",
    ending: "EVERY ENDING punishes someone innocent. The game's argument: accusation spreads because the system rewards certainty, not truth."
  },

  // Shown on the ending screen ("How the game argues")
  rhetoric: [
    ["Limited hours per day", "Time pressure forces snap judgments, like the rushed Salem trials. (fear, judgment)"],
    ["Kind / Direct / Intimidate type chart", "Rhetorical approach changes what people say. Intimidation is 'super effective' but every result is false, like coerced confessions. (fear, accusation)"],
    ["Fact / Testimony / Inference journal", "The player must weigh source credibility, the thing Salem's court ignored with spectral evidence. (judgment)"],
    ["Hysteria meter with a rising floor", "You can slow hysteria but never stop it. It always hits 100%. (hysteria)"],
    ["Town meetings", "Even true evidence gets twisted when the crowd hears it ('BLOOD?'). (paranoia, hysteria)"],
    ["The detective's hallucinations", "The hunter sees what he expects, so his own eyes become false evidence. (paranoia, spectral evidence)"],
    ["Characters built on themes", "Wibigail = resentment and accusation, Pan Nama = grudges, Jroctor = shame, Abutit = fear, Rarris = judgment. Wibigail and Pan Nama hate each other."],
    ["Endings", "Accusing anyone condemns an innocent. Refusing gets YOU condemned. There is no road between."]
  ]
};
