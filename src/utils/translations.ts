export const translations = {
    en: {
        appTitle: "SivaAstro",
        nav: {
            birthDetails: "Birth Details",
            chart: "Vedic Chart",
            analysis: "Analysis",
            predictions: "AI Astrologer",
            dashboard: "Dashboard",
            login: "Login",
            signup: "Sign Up"
        },
        auth: {
            loginTitle: "Welcome Back",
            loginSubtitle: "Sign in to access your saved charts and predictions",
            registerTitle: "Create Account",
            registerSubtitle: "Join us to save your charts and get personalized insights",
            email: "Email Address",
            password: "Password",
            name: "Full Name",
            loginBtn: "Sign In",
            registerBtn: "Create Account",
            googleBtn: "Continue with Google",
            noAccount: "Don't have an account?",
            hasAccount: "Already have an account?",
            verifyEmail: "Check Your Email!",
            verifySubtitle: "We've sent a verification link to",
            resend: "Resend Verification Email",
            backToLogin: "Back to Login",
            checkSpam: "Please also check your spam/junk folder.",
            disposableEmail: "Temporary/Disposable emails are not allowed.",
            emailInUse: "Account already exists. Please login or check existing verification email.",
            verificationRequired: "Email Verification Required",
            verificationRequiredMsg: "Please verify your email address to access this feature.",
            passwordTooShort: "Password must be at least 8 characters",
            passwordRequirements: "Password must satisfy criteria (A-Z, a-z, 0-9, special char)"
        },
        dashboard: {
            title: "My Cosmic Dashboard",
            createBtn: "Create New Birth Chart",
            logout: "Logout",
            noCharts: "No Charts Yet",
            noChartsSub: "Create your first birth chart to begin your cosmic journey",
            getStarted: "Get Started",
            viewChart: "View Chart",
            loading: "Loading your charts..."
        },
        input: {
            title: "Discover Your Cosmic Blueprint",
            subtitle: "Enter your birth details to generate an authentic South Indian Vedic chart.",
            name: "Full Name",
            dob: "Date of Birth",
            tob: "Time of Birth",
            pob: "Place of Birth",
            searchPlaceholder: "Search city...",
            generateBtn: "Generate Vedic Chart",
            generating: "Calculating Planetary Positions...",
            gender: "Gender",
            male: "Male",
            female: "Female",
            other: "Other",
            unknownTime: "I don't know my birth time",
            estimatedLagna: "Estimated Lagna",
            confidence: "confidence"
        },
        chart: {
            title: "South Indian Chart",
            lagna: "Lagna (Asc)",
            note: "* Chart calculated using Lahiri Ayanamsa (Sidereal)"
        },
        analysis: {
            title: "Detailed Analysis",
            subtitle: "Planetary Positions & Yogas",
            planets: "Planetary Positions",
            yogas: "Yogas (Fortunes)",
            doshas: "Doshas (Challenges)",
            noYogas: "No major yogas detected in this simplified analysis.",
            noDoshas: "No major doshas detected.",
            table: {
                planet: "Planet",
                sign: "Sign (Rasi)",
                degree: "Degree",
                nakshatra: "Nakshatra",
                pada: "Pada"
            }
        },
        predictions: {
            title: "AI Astrologer",
            subtitle: "Powered by Claude 3.5 Sonnet",
            apiKeyLabel: "Enter Anthropic API Key",
            apiKeyPlaceholder: "sk-ant-...",
            generateBtn: "Generate Full Reading",
            note: "Your key is used directly in your browser and not stored.",
            askPlaceholder: "Ask a follow-up question..."
        },
        dasha: {
            title: "Vimshottari Dasha Periods",
            current: "Current Period",
            timeline: "Dasha Timeline",
            remaining: "Remaining",
            ends: "Ends",
            maha: "Maha Dasha",
            bhukti: "Bhukti",
            antaram: "Antaram"
        },
        dignity: {
            exalted: "Exalted",
            debilitated: "Debilitated",
            ownSign: "Own Sign",
            greatFriend: "Great Friend",
            friend: "Friend",
            neutral: "Neutral",
            enemy: "Enemy",
            greatEnemy: "Great Enemy",
            neechaBhanga: "Neecha Bhanga"
        },
        strength: {
            sthana: "Positional Strength",
            dig: "Directional Strength",
            kala: "Temporal Strength",
            cheshta: "Motional Strength",
            total: "Total Strength"
        },
        aspects: {
            title: "Planetary Aspects",
            aspects: "Aspects",
            conjunction: "Conjunction"
        },
        advancedYogas: {
            parivartana: "Parivartana Yoga",
            mahaParivartana: "Maha Parivartana",
            kahalaParivartana: "Kahala Parivartana",
            dainyaParivartana: "Dainya Parivartana",
            neechaBhangaRajaYoga: "Neecha Bhanga Raja Yoga"
        },
        subathuvam: {
            title: "Subathuvam & Pavathuvam Analysis",
            houseTitle: "House Analysis (Bhava Subathuvam)",
            subathuvam: "Subathuvam (Goodness)",
            pavathuvam: "Pavathuvam (Badness)",
            house: "House"
        },
        planets: {
            Sun: "Sun",
            Moon: "Moon",
            Mars: "Mars",
            Mercury: "Mercury",
            Jupiter: "Jupiter",
            Venus: "Venus",
            Saturn: "Saturn",
            Rahu: "Rahu",
            Ketu: "Ketu",
            Ascendant: "Ascendant"
        },
        featurePopup: {
            title: "Feature Access Info",
            availableTitle: "Available Without Login:",
            availableItems: [
                "Birth Details",
                "Vedic Chart (Rasi)",
                "Vimshottari Dasha Periods"
            ],
            lockedTitle: "Login Required for:",
            lockedItems: [
                "12 House Analysis",
                "AI Astrologer Chat",
                "Daily Snapshot",
                "Save & Track Your Charts"
            ],
            loginMsg: "Please login to access full features",
            loginBtn: "Login",
            signupBtn: "Sign Up"
        },
        forecast: {
            title: "Next 15 Days Forecast (Dasa + Gocharam)",
            dasaContext: "Current Dasa Context"
        },
        gocharam: {
            status: {
                Excellent: "Excellent",
                Good: "Good",
                Moderate: "Moderate",
                Difficult: "Difficult",
                SadeSati: "Sade Sati",
                Ashtama: "Ashtama Sani",
                Ardhastama: "Ardhastama Sani",
                Danger: "Danger",
                Caution: "Caution",
                Average: "Average"
            },
            description: {
                favorable: "{planet} is in a favorable position (House {house}). Expect positive results.",
                unfavorable: "{planet} is in a challenging position (House {house}). Caution advised.",
                neutral: "{planet} gives mixed or neutral results (House {house}).",
                vedhai: "{planet} is in a favorable position (House {house}), but obstructed (Vedhai) by another planet. Results will be muted.",
                sadeSatiJanma: "Janma Sani (Peak Sade Sati). Intense pressure, mental stress. Stay disciplined.",
                sadeSatiViraya: "Viraya Sani (Start of Sade Sati). Expenses and wandering.",
                sadeSatiPada: "Pada Sani (End of Sade Sati). Family / Financial stress.",
                ashtama: "Ashtama Sani (8th House). Critical time. Avoid insults, new ventures.",
                ardhastama: "Ardhastama Sani (4th House). Domestic concerns, mother's health.",
                aspectProtection: "However, Jupiter's aspect on {aspects} provides strong protection."
            },
            predictions: {
                great: "Excellent alignment of Dasa and Transits favors success in endeavors. A productive day awaiting you.",
                good: "Favorable gocharam flows support your Dasa. Good progress in daily activities expected.",
                danger: "High alert. Both Moon and Saturn are in challenging positions. Keep a low profile and avoid risks.",
                stress: "Planetary positions indicate potential friction. Avoid arguments and postpone major decisions.",
                mixed: "Mixed results expected. Outcomes depend on your effort and patience today."
            },
            factors: {
                chandrashtama: "Chandrashtama (Moon in 8th) - Avoid new decisions.",
                dasaHidden: "{dasa} (Dasa Lord) in hidden house {house}.",
                dasaStrong: "{dasa} (Dasa Lord) strongly placed.",
                transitGood: "{planet} in {house} (Good)",
                transitBad: "{planet} in {house} (Challenging)",
                transitNeutral: "{planet} in {house} (Avg)",
                transitMixed: "{planet} in {house}",
                taraGood: "Star: {star} - {tara} (Favorable)",
                taraBad: "Star: {star} - {tara} (Unfavorable)"
            },
            verdicts: {
                dontWorry: "Don't Worry!",
                dontWorryMsg: "Your Dasa is Strong (Master). Bad transit effects (Messenger) will be minimal.",
                golden: "Golden Period!",
                goldenMsg: "Both Dasa (Master) and Gocharam (Messenger) are Excellent! Capitalize on this.",
                doubleTrouble: "Double Trouble - High Alert",
                doubleTroubleMsg: "Weak Dasa + Bad Transit. Stay very low profile. Avoid risks.",
                tempRelief: "Temporary Relief",
                tempReliefMsg: "Dasa is weak, but Gocharam brings some 'rain' to dry land.",
                caution: "Caution",
                cautionMsg: "Average Dasa with challenging Transits. Be careful.",
                goodProgress: "Good Progress",
                goodProgressMsg: "Transits are supporting average Dasa."
            },
            taraBala: {
                janma: "Janma (Body Stress)",
                sampath: "Sampath (Wealth/Prosperity)",
                vipat: "Vipat (Danger/Obstacle)",
                kshema: "Kshema (Well-being)",
                pratyak: "Pratyak (Obstruction)",
                sadhana: "Sadhana (Success)",
                naidhana: "Naidhana (Danger/Loss)",
                mitra: "Mitra (Friendly)",
                paramaMitra: "Parama Mitra (Supreme Friend)"
            }
        }
    },
    ta: {
        appTitle: "சிவா அஸ்ட்ரோ",
        nav: {
            birthDetails: "பிறப்பு விவரங்கள்",
            chart: "ஜாதக கட்டம்",
            analysis: "பலன்கள்",
            predictions: "AI கணிப்புகள்",
            dashboard: "முகப்பு",
            login: "உள்நுழைய",
            signup: "பதிவு செய்ய"
        },
        auth: {
            loginTitle: "மீண்டும் வருக",
            loginSubtitle: "உங்கள் சேமிக்கப்பட்ட ஜாதகங்களை அணுக உள்நுழையவும்",
            registerTitle: "கணக்கை உருவாக்கவும்",
            registerSubtitle: "உங்கள் ஜாதகங்களை சேமிக்க எங்களுடன் இணையுங்கள்",
            email: "மின்னஞ்சல் முகவரி",
            password: "கடவுச்சொல்",
            name: "முழு பெயர்",
            loginBtn: "உள்நுழைய",
            registerBtn: "கணக்கை உருவாக்கவும்",
            googleBtn: "Google மூலம் தொடரவும்",
            noAccount: "கணக்கு இல்லையா?",
            hasAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
            verifyEmail: "மின்னஞ்சலை சரிபார்க்கவும்!",
            verifySubtitle: "நாங்கள் ஒரு சரிபார்ப்பு இணைப்பை அனுப்பியுள்ளோம்",
            resend: "சரிபார்ப்பு மின்னஞ்சலை மீண்டும் அனுப்பு",
            backToLogin: "உள்நுழைவுக்கு திரும்பவும்",
            checkSpam: "தயவுசெய்து உங்கள் ஸ்பேம் (Spam) ஃபோல்டரையும் சரிபார்க்கவும்.",
            disposableEmail: "தற்காலிக மின்னஞ்சல்கள் அனுமதிக்கப்படாது.",
            emailInUse: "கணக்கு ஏற்கனவே உள்ளது. உள்நுழையவும் அல்லது மின்னஞ்சலைச் சரிபார்க்கவும்.",
            verificationRequired: "மின்னஞ்சல் சரிபார்ப்பு தேவை",
            verificationRequiredMsg: "இந்த அம்சத்தை அணுக உங்கள் மின்னஞ்சலை சரிபார்க்கவும்.",
            passwordTooShort: "கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும்",
            passwordRequirements: "கடவுச்சொல் வலிமையாக இருக்க வேண்டும் (A-Z, a-z, 0-9, special char)"
        },
        dashboard: {
            title: "எனது ஜாதகங்கள்",
            createBtn: "புதிய ஜாதகத்தை உருவாக்கவும்",
            logout: "வெளியேறு",
            noCharts: "ஜாதகங்கள் இல்லை",
            noChartsSub: "உங்கள் ஜோதிட பயணத்தைத் தொடங்க முதல் ஜாதகத்தை உருவாக்கவும்",
            getStarted: "தொடங்கவும்",
            viewChart: "ஜாதகத்தை பார்க்க",
            loading: "ஜாதகங்கள் ஏற்றப்படுகின்றன..."
        },
        input: {
            title: "உங்கள் ஜாதகத்தை கண்டறியவும்",
            subtitle: "தென்னிந்திய முறைப்படி ஜாதகம் கணிக்க உங்கள் விவரங்களை உள்ளிடவும்.",
            name: "முழு பெயர்",
            dob: "பிறந்த தேதி",
            tob: "பிறந்த நேரம்",
            pob: "பிறந்த இடம்",
            searchPlaceholder: "நகரத்தை தேடவும்...",
            generateBtn: "ஜாதகம் கணிக்கவும்",
            generating: "கோள்களின் நிலை கணக்கிடப்படுகிறது...",
            gender: "பாலினம்",
            male: "ஆண்",
            female: "பெண்",
            other: "பிற",
            unknownTime: "எனது பிறந்த நேரம் தெரியாது",
            estimatedLagna: "மதிப்பீட்டு லக்னம்",
            confidence: "நம்பிக்கை"
        },
        chart: {
            title: "இராசி கட்டம்",
            lagna: "லக்னம்",
            note: "* லஹிரி அயனாம்சம் (வாக்கியம்) பயன்படுத்தி கணிக்கப்பட்டது"
        },
        analysis: {
            title: "விரிவான ஆய்வு",
            subtitle: "கிரக நிலைகள் மற்றும் யோகங்கள்",
            planets: "கிரக நிலைகள்",
            yogas: "யோகங்கள்",
            doshas: "தோஷங்கள்",
            noYogas: "குறிப்பிடத்தக்க யோகங்கள் எதுவும் கண்டறியப்படவில்லை.",
            noDoshas: "குறிப்பிடத்தக்க தோஷங்கள் எதுவும் இல்லை.",
            table: {
                planet: "கிரகம்",
                sign: "இராசி",
                degree: "பாகை",
                nakshatra: "நட்சத்திரம்",
                pada: "பாதம்"
            }
        },
        predictions: {
            title: "AI ஜோதிடர்",
            subtitle: "Claude 3.5 Sonnet மூலம் இயங்குகிறது",
            apiKeyLabel: "Anthropic API குறியீட்டை உள்ளிடவும்",
            apiKeyPlaceholder: "sk-ant-...",
            generateBtn: "முழு பலன்களை கணிக்கவும்",
            note: "உங்கள் குறியீடு பாதுகாப்பாக உள்ளது, சேமிக்கப்படாது.",
            askPlaceholder: "கேள்வி கேட்கவும்..."
        },
        dasha: {
            title: "விம்சோத்தரி தசை",
            current: "தற்போதைய தசை",
            timeline: "தசை காலவரிசை",
            remaining: "மீதமுள்ளது",
            ends: "முடிவு",
            maha: "மகா தசை",
            bhukti: "புத்தி",
            antaram: "அந்தரம்"
        },
        dignity: {
            exalted: "உச்சம்",
            debilitated: "நீசம்",
            ownSign: "சொந்த வீடு",
            greatFriend: "அதி நட்பு",
            friend: "நட்பு",
            neutral: "சமம்",
            enemy: "பகை",
            greatEnemy: "அதி பகை",
            neechaBhanga: "நீச பங்கம்"
        },
        strength: {
            sthana: "ஸ்தான பலம்",
            dig: "திக் பலம்",
            kala: "கால பலம்",
            cheshta: "சேஷ்டா பலம்",
            total: "மொத்த பலம்"
        },
        aspects: {
            title: "கிரக பார்வைகள்",
            aspects: "பார்வைகள்",
            conjunction: "இணைவு"
        },
        advancedYogas: {
            parivartana: "பரிவர்த்தனை யோகம்",
            mahaParivartana: "மகா பரிவர்த்தனை",
            kahalaParivartana: "காஹள பரிவர்த்தனை",
            dainyaParivartana: "தைன்ய பரிவர்த்தனை",
            neechaBhangaRajaYoga: "நீச பங்க ராஜ யோகம்"
        },
        subathuvam: {
            title: "சுபத்துவம் & பாத்துவம் ஆய்வு",
            houseTitle: "பாவ சுபத்துவம் (வீடு ஆய்வு)",
            subathuvam: "சுபத்துவம் (நன்மை)",
            pavathuvam: "பாத்துவம் (தீமை)",
            house: "பாவம்"
        },
        planets: {
            Sun: "சூரியன்",
            Moon: "சந்திரன்",
            Mars: "செவ்வாய்",
            Mercury: "புதன்",
            Jupiter: "குரு",
            Venus: "சுக்கிரன்",
            Saturn: "சனி",
            Rahu: "ராகு",
            Ketu: "கேது",
            Ascendant: "லக்னம்"
        },
        featurePopup: {
            title: "அம்ச அணுகல் தகவல்",
            availableTitle: "உள்நுழைவு இல்லாமல் கிடைக்கும்:",
            availableItems: [
                "பிறப்பு விவரங்கள்",
                "வேத ஜாதகம்",
                "விம்ஷோத்தரி தசா"
            ],
            lockedTitle: "உள்நுழைவு தேவை:",
            lockedItems: [
                "12 பாவ பகுப்பாய்வு",
                "AI ஜோதிடர் அரட்டை",
                "தினசரி கணிப்பு",
                "உங்கள் ஜாதகங்களை சேமிக்கவும்"
            ],
            loginMsg: "முழு அம்சங்களுக்கு தயவுசெய்து உள்நுழைக",
            loginBtn: "உள்நுழைய",
            signupBtn: "பதிவு செய்க"
        },
        forecast: {
            title: "அடுத்த 15 நாட்கள் கணிப்பு (தசை + கோச்சாரம்)",
            dasaContext: "தற்போதைய தசை சூழல்"
        },
        gocharam: {
            status: {
                Excellent: "மிகச்சிறப்பு",
                Good: "நன்று",
                Moderate: "மத்திமம்",
                Difficult: "கடினம்",
                SadeSati: "ஏழரை சனி",
                Ashtama: "அஷ்டம சனி",
                Ardhastama: "அர்த்தாஷ்டம சனி",
                Danger: "ஆபத்து",
                Caution: "எச்சரிக்கை",
                Average: "சராசரி"
            },
            descriptions: {
                favorable: "{planet} சாதகமான நிலையில் (இடம் {house}) உள்ளது. நல்ல பலன்கள் எதிர்பார்க்கலாம்.",
                unfavorable: "{planet} கடினமான நிலையில் (இடம் {house}) உள்ளது. கவனம் தேவை.",
                neutral: "{planet} கலவையான பலன்களைத் தரும் (இடம் {house}).",
                vedhai: "{planet} நல்ல நிலையில் (இடம் {house}) இருந்தாலும், வேதை (தடை) உள்ளது. பலன்கள் குறையும்.",
                sadeSatiJanma: "ஜென்ம சனி (ஏழரை சனி உச்சம்). அதிக அழுத்தம், மன உளைச்சல். கட்டுப்பாடு தேவை.",
                sadeSatiViraya: "விரய சனி (ஏழரை சனி ஆரம்பம்). செலவுகள் மற்றும் அலைச்சல்.",
                sadeSatiPada: "பாத சனி (ஏழரை சனி முடிவு). குடும்பம் / நிதி ரீதியான அழுத்தம்.",
                ashtama: "அஷ்டம சனி (8-ம் இடம்). மிக முக்கிய நேரம். அவமானங்கள், புதிய முயற்சிகளில் கவனம்.",
                ardhastama: "அர்த்தாஷ்டம சனி (4-ம் இடம்). குடும்ப கவலைகள், தாயார் உடல்நலம்.",
                aspectProtection: "இருப்பினும், குருவின் பார்வை {aspects} இடங்களின் மீது உள்ளதால் நல்ல பாதுகாப்பு கிடைக்கும்."
            },
            predictions: {
                great: "தசா மற்றும் கோச்சார நிலைகள் சிறப்பாக உள்ளன. முயற்சிகளில் வெற்றி கிட்டும். பயனுள்ள நாள்.",
                good: "சாதகமான கோச்சார சூழல் உங்கள் தசையை ஆதரிக்கிறது. நல்ல முன்னேற்றம் உண்டு.",
                danger: "எச்சரிக்கை. சந்திரன் மற்றும் சனி ஆகிய இரு கிரக நிலைகளும் சரியில்லை. அமைதி காக்கவும்.",
                stress: "கிரக நிலைகள் சற்று சாதகமற்றதாக உள்ளன. விவாதங்களைத் தவிர்க்கவும், முக்கிய முடிவுகளை ஒத்திவைக்கவும்.",
                mixed: "கலவையான பலன்கள் எதிர்பார்க்கலாம். உங்கள் முயற்சியைப் பொறுத்தே இன்றைய பலன் அமையும்."
            },
            factors: {
                chandrashtama: "சந்திராஷ்டமம் (8-ல் சந்திரன்) - புதிய முடிவுகளை தவிர்க்கவும்.",
                dasaHidden: "{dasa} (தசை நாதன்) மறைவு ஸ்தானத்தில் {house}.",
                dasaStrong: "{dasa} (தசை நாதன்) வலுவாக உள்ளார்.",
                transitGood: "{planet} {house}-ல் (நன்று)",
                transitBad: "{planet} {house}-ல் (சிரமம்)",
                transitNeutral: "{planet} {house}-ல் (சராசரி)",
                transitMixed: "{planet} {house}-ல்",
                taraGood: "நட்சத்திரம்: {star} - {tara} (சாதகம்)",
                taraBad: "நட்சத்திரம்: {star} - {tara} (சாதகமற்றது)"
            },
            verdicts: {
                dontWorry: "கவலை வேண்டாம்!",
                dontWorryMsg: "உங்கள் தசை வலுவாக உள்ளது (Master). கோச்சார பாதிப்புகள் (Messenger) குறைவாகவே இருக்கும்.",
                golden: "பொற்காலம்!",
                goldenMsg: "தசை (Master) மற்றும் கோச்சாரம் (Messenger) இரண்டும் சிறப்பாக உள்ளன! இதை பயன்படுத்திக்கொள்ளுங்கள்.",
                doubleTrouble: "இரட்டை ஆபத்து - எச்சரிக்கை",
                doubleTroubleMsg: "பலவீனமான தசை + மோசமான கோச்சாரம். மிகவும் கவனமாக இருக்கவும்.",
                tempRelief: "தற்காலிக நிம்மதி",
                tempReliefMsg: "தசை பலவீனமாக உள்ளது, ஆனால் கோச்சாரம் சிறிது ஆறுதல் தருகிறது.",
                caution: "எச்சரிக்கை",
                cautionMsg: "சராசரி தசை மற்றும் கடினமான கோச்சாரம். கவனமாக இருக்கவும்.",
                goodProgress: "நல்ல முன்னேற்றம்",
                goodProgressMsg: "கோச்சாரம் தசையை ஆதரிக்கிறது."
            },
            taraBala: {
                janma: "ஜென்மம் (உடல் சோர்வு)",
                sampath: "சம்பத்து (செல்வம்/வரவு)",
                vipat: "விபத்து (ஆபத்து/தடை)",
                kshema: "ஷேமம் (நலம்)",
                pratyak: "பிரத்யக் (தடை/எதிர்ப்பு)",
                sadhana: "சாதனா (வெற்றி)",
                naidhana: "வதை (ஆபத்து/இழப்பு)",
                mitra: "மித்ரம் (நட்பு)",
                paramaMitra: "பரம மித்ரம் (சிறந்த நட்பு)"
            }
        }
    }
};

export const TAMIL_PLANET_NAMES: Record<string, string> = {
    Sun: "சூரியன்",
    Moon: "சந்திரன்",
    Mars: "செவ்வாய்",
    Mercury: "புதன்",
    Jupiter: "குரு",
    Venus: "சுக்கிரன்",
    Saturn: "சனி",
    Rahu: "ராகு",
    Ketu: "கேது",
    Ascendant: "லக்னம்"
};

export const TAMIL_PLANET_ABBREVIATIONS: Record<string, string> = {
    Sun: "சூ",
    Moon: "ச",
    Mars: "செ",
    Mercury: "பு",
    Jupiter: "குரு",
    Venus: "சு",
    Saturn: "சனி",
    Rahu: "ராகு",
    Ketu: "கேது",
    Ascendant: "ல"
};

export const TAMIL_NAKSHATRAS = [
    "அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை",
    "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
    "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
    "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்",
    "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
];
