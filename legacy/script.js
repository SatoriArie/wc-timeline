// Данные событий для таймлинии
const timelineData = {
    'titans-ordering': {
        title: 'Создание мира',
        year: '~200,000 лет до ОВ',
        description: `
            <p>Титаны, древние существа космического масштаба, прибыли на Азерот для борьбы с силами Пустоты, которые угрожали зарождающейся мировой душе планеты. Пантеон Титанов, ведомый Аманом'Тулом, обнаружил, что Азерот заражён Древними Богами — паразитическими сущностями Пустоты.</p>
            
            <p>Великая война между Титанами и Древними Богами длилась тысячелетия. Титаны поняли, что полное уничтожение Древних Богов может повредить мировую душу Азерота, поэтому они заключили их в тюрьмы глубоко под землёй.</p>
            
            <p>После победы Титаны создали расу каменных существ — земельников, чтобы те защищали мир от будущих угроз. Они также наделили драконов силой для охраны различных аспектов мира.</p>
        `,
        images: [
            'https://via.placeholder.com/300x200/4fc3f7/ffffff?text=Титаны',
            'https://via.placeholder.com/300x200/ffd700/000000?text=Пантеон'
        ],
        videos: [
            {
                title: 'История Титанов - Warcraft Lore',
                url: 'https://www.youtube.com/watch?v=example1'
            }
        ],
        books: [
            {
                title: 'Warcraft Chronicle Volume 1',
                cover: '📚'
            }
        ],
        games: ['Warcraft III', 'World of Warcraft'],
        characters: ['Аман\'Тул', 'Саргерас'],
        notes: 'Это событие заложило основу для всей последующей истории Азерота. Влияние Титанов ощущается до сих пор через их творения и артефакты.'
    },
    
    'war-of-ancients': {
        title: 'Война Древних',
        year: '~10,000 лет до ОВ',
        category: 'wars',
        description: `
            <p>Война Древних стала поворотным моментом в истории Азерота. Королева <a href="#" class="character-link" data-character="azshara">Азшара</a> и её Высокорождённые эльфы, опьянённые магической силой Колодца Вечности, привлекли внимание <a href="#" class="character-link" data-character="sargeras">Саргераса</a> — падшего титана и повелителя Пылающего Легиона.</p>
            
            <p>Саргерас соблазнил Азшару обещаниями ещё большей силы, и она согласилась открыть портал для вторжения демонов. Пылающий Легион хлынул в мир, неся разрушение и хаос.</p>
            
            <p>Сопротивление возглавили <a href="#" class="character-link" data-character="malfurion">Малфурион Ярость Бури</a>, его брат <a href="#" class="character-link" data-character="illidan">Иллидан</a> и жрица <a href="#" class="character-link" data-character="tyrande">Тиранда Шелест Ветра</a>. Они объединились с драконами и другими расами для борьбы с демонической угрозой.</p>
            
            <p>Война завершилась Великим Расколом — разрушением Колодца Вечности, которое раскололо континент и изменило лицо мира навсегда.</p>
        `,
        images: [
            'https://via.placeholder.com/300x200/32cd32/ffffff?text=Война+Древних',
            'https://via.placeholder.com/300x200/ff6b6b/ffffff?text=Легион'
        ],
        videos: [
            {
                title: 'Война Древних - Полная история',
                url: 'https://www.youtube.com/watch?v=example2'
            },
            {
                title: 'Великий Раскол - Синематик',
                url: 'https://www.youtube.com/watch?v=example3'
            }
        ],
        books: [
            {
                title: 'Война Древних: Источник Вечности',
                cover: '📖'
            },
            {
                title: 'Warcraft Chronicle Volume 1',
                cover: '📚'
            }
        ],
        games: ['Warcraft III', 'World of Warcraft'],
        characters: ['Азшара', 'Саргерас', 'Малфурион', 'Иллидан', 'Тиранда'],
        notes: 'Это событие разделило историю на "до" и "после". Многие современные конфликты берут своё начало именно в Войне Древних.'
    },
    
    'founding-quelthalas': {
        title: 'Основание Кель\'Таласа',
        year: '~3,000 лет до ОВ',
        category: 'characters',
        description: `
            <p>После Великого Раскола группа Высокорождённых эльфов под предводительством Дат'Ремара Солнечного Скитальца отправилась на поиски нового дома. Они не могли больше выносить потерю магической силы после разрушения Колодца Вечности.</p>
            
            <p>Путешествие длилось тысячи лет, и за это время эльфы изменились — их кожа стала бледнее, а глаза приобрели золотистый оттенок. Они стали называться высшими эльфами.</p>
            
            <p>В северных лесах Лордерона они обнаружили мощную магическую энергию и основали королевство Кель'Талас. В центре нового королевства они создали Солнечный Колодец, используя воды из оригинального Колодца Вечности.</p>
        `,
        images: [
            'https://via.placeholder.com/300x200/ffd700/000000?text=Кель\'Талас',
            'https://via.placeholder.com/300x200/4fc3f7/ffffff?text=Высшие+эльфы'
        ],
        videos: [
            {
                title: 'История высших эльфов',
                url: 'https://www.youtube.com/watch?v=example4'
            }
        ],
        books: [
            {
                title: 'Warcraft Chronicle Volume 1',
                cover: '📚'
            },
            {
                title: 'Война Древних: Источник Вечности',
                cover: '📖'
            }
        ],
        games: ['Warcraft III', 'World of Warcraft'],
        characters: ['Дат\'Ремар Солнечный Скиталец'],
        notes: 'Основание Кель\'Таласа положило начало цивилизации высших эльфов, которая просуществовала тысячи лет до вторжения Плети.'
    },
    
    'first-war': {
        title: 'Первая война',
        year: '0-6 год ОВ',
        category: 'wars',
        description: `
            <p>Первая война ознаменовала начало конфликта между орками и людьми. Орки Дренора, развращённые демонической кровью, прошли через Тёмный Портал в Болота Печали и начали своё вторжение в Азерот.</p>
            
            <p>Королевство Штормград стало первой жертвой орочьей агрессии. Несмотря на героическое сопротивление, включая подвиги сэра Лотара и короля Ллейна, люди потерпели поражение.</p>
            
            <p>Штормград пал, король Ллейн был убит, а выжившие беженцы бежали в северные королевства. Это поражение стало катализатором для объединения человеческих наций.</p>
        `,
        images: [
            'https://via.placeholder.com/300x200/8b4513/ffffff?text=Штормград',
            'https://via.placeholder.com/300x200/ff6b6b/ffffff?text=Орки'
        ],
        videos: [
            {
                title: 'Первая война - Хроники',
                url: 'https://www.youtube.com/watch?v=example5'
            }
        ],
        books: [
            {
                title: 'Warcraft: Orcs & Humans',
                cover: '🎮'
            },
            {
                title: 'Warcraft Chronicle Volume 2',
                cover: '📚'
            },
            {
                title: 'Последний Страж',
                cover: '📖'
            }
        ],
        games: ['Warcraft: Orcs & Humans', 'World of Warcraft'],
        characters: ['Андуин Лотар', 'Король Ллейн', 'Блэкхенд', 'Медив'],
        notes: 'Первая война показала, что изолированные королевства не могут противостоять объединённой угрозе. Это привело к созданию Альянса.'
    },
    
    'soulstone-destruction': {
        title: 'Разрушение Камня Душ',
        year: '25 год ОВ',
        category: 'artifacts',
        description: `
            <p>Камень Душ был могущественным артефактом, созданным орочьим чернокнижником <a href="#" class="character-link" data-character="guldan">Гул'даном</a> для контроля над Ордой. Этот тёмный кристалл содержал души убитых драенейских старейшин и давал Гул'дану огромную силу.</p>
            
            <p>После смерти Гул'дана во время экспедиции к Гробнице Саргераса, Камень Душ попал в руки <a href="#" class="character-link" data-character="nerzhul">Нер'зула</a>. Используя артефакт, Нер'зул открыл множественные порталы с Дренора, что привело к разрушению планеты.</p>
            
            <p>Экспедиция Альянса под командованием <a href="#" class="character-link" data-character="turalyon">Туралиона</a> и <a href="#" class="character-link" data-character="alleria">Аллерии Ветрокрылой</a> проникла на умирающий Дренор и уничтожила Камень Душ, закрыв порталы, но оказавшись заперта в разрушающемся мире.</p>
        `,
        images: [
            'https://via.placeholder.com/300x200/9c27b0/ffffff?text=Камень+Душ',
            'https://via.placeholder.com/300x200/ff4444/ffffff?text=Дренор'
        ],
        videos: [
            {
                title: 'Разрушение Дренора',
                url: 'https://www.youtube.com/watch?v=example6'
            }
        ],
        books: [
            {
                title: 'За Тёмным Порталом',
                cover: '📚'
            },
            {
                title: 'Warcraft Chronicle Volume 2',
                cover: '📖'
            }
        ],
        games: ['Warcraft II: Beyond the Dark Portal', 'World of Warcraft'],
        characters: ['Гул\'дан', 'Нер\'зул', 'Туралион', 'Аллерия'],
        notes: 'Уничтожение Камня Душ спасло Азерот от дальнейших вторжений, но стоило жизней многих героев Альянса.'
    },
    
    'second-war': {
        title: 'Вторая война',
        year: '6-8 год ОВ',
        category: 'wars',
        description: `
            <p>Вторая война началась, когда новая Орда под предводительством <a href="#" class="character-link" data-character="orgrim">Оргрима Молота Рока</a> возобновила наступление на человеческие королевства. Альянс Лордерона объединил семь наций для противостояния орочьей угрозе.</p>
            
            <p>Война характеризовалась масштабными сражениями на суше и на море. Орки заключили союз с троллями Лесными Секирами и гоблинами, в то время как Альянс получил поддержку гномов и высших эльфов Кель'Таласа.</p>
            
            <p>Конфликт завершился победой Альянса после разрушения Тёмного Портала и пленения большинства орков. Выжившие орки были заключены в лагеря для интернированных, где они впали в летаргию без демонической крови.</p>
        `,
        images: [
            'https://via.placeholder.com/300x200/4169e1/ffffff?text=Альянс',
            'https://via.placeholder.com/300x200/8b4513/ffffff?text=Орда'
        ],
        videos: [
            {
                title: 'Вторая война - Хроники',
                url: 'https://www.youtube.com/watch?v=example7'
            }
        ],
        books: [
            {
                title: 'Warcraft II: Tides of Darkness',
                cover: '🎮'
            },
            {
                title: 'Warcraft Chronicle Volume 2',
                cover: '📚'
            }
        ],
        games: ['Warcraft II', 'World of Warcraft'],
        characters: ['Оргрим Молот Рока', 'Андуин Лотар', 'Кадгар'],
        notes: 'Вторая война показала важность союзов и привела к созданию лагерей для интернированных орков.'
    },
    
    'arthas-birth': {
        title: 'Рождение Артаса',
        year: '-10 год ОВ',
        category: 'characters',
        description: `
            <p>Артас Менетил родился в королевской семье Лордерона, сын короля <a href="#" class="character-link" data-character="terenas">Теренаса Менетила II</a>. С раннего детства он проявлял благородство и стремление защищать свой народ.</p>
            
            <p>Принц получил превосходное образование и военную подготовку. Он был обучен искусству владения мечом и тактике, а также изучал историю и дипломатию под руководством лучших наставников королевства.</p>
            
            <p>В юности Артас подружился с <a href="#" class="character-link" data-character="jaina">Джайной Праудмур</a> и <a href="#" class="character-link" data-character="muradin">Мурадином Бронзобородом</a>. Эти отношения сформировали его характер и мировоззрение в ранние годы.</p>
        `,
        images: [
            'https://via.placeholder.com/300x200/4fc3f7/ffffff?text=Лордерон',
            'https://via.placeholder.com/300x200/ffd700/000000?text=Принц'
        ],
        videos: [
            {
                title: 'История Артаса - Ранние годы',
                url: 'https://www.youtube.com/watch?v=example8'
            }
        ],
        books: [
            {
                title: 'Артас: Восхождение Короля-лича',
                cover: '📚'
            },
            {
                title: 'Warcraft Chronicle Volume 3',
                cover: '📖'
            }
        ],
        games: ['Warcraft III', 'World of Warcraft: Wrath of the Lich King'],
        characters: ['Артас', 'Теренас', 'Джайна'],
        notes: 'Рождение Артаса предвещало как великие надежды, так и будущую трагедию Лордерона.'
    },
    
    'third-war': {
        title: 'Третья война',
        year: '20-22 год ОВ',
        category: 'wars',
        description: `
            <p>Третья война стала кульминацией планов Пылающего Легиона по вторжению в Азерот. Война началась с распространения чумы нежити в Лордероне, которая превращала людей в зомби и скелетов.</p>
            
            <p>Принц Артас, пытаясь остановить чуму, принял ряд морально сомнительных решений, включая резню в Стратхольме. Его путь привёл его к Ледяной Скорби и превращению в рыцаря смерти.</p>
            
            <p>Война завершилась битвой за гору Хиджал, где объединённые силы Альянса, Орды и ночных эльфов смогли остановить вторжение Архимонда и Пылающего Легиона.</p>
        `,
        images: [
            'https://via.placeholder.com/300x200/ff4444/ffffff?text=Плеть',
            'https://via.placeholder.com/300x200/32cd32/ffffff?text=Хиджал'
        ],
        videos: [
            {
                title: 'Третья война - Полная история',
                url: 'https://www.youtube.com/watch?v=example9'
            }
        ],
        books: [
            {
                title: 'Warcraft III: Reign of Chaos',
                cover: '🎮'
            },
            {
                title: 'Артас: Восхождение Короля-лича',
                cover: '📚'
            }
        ],
        games: ['Warcraft III: Reign of Chaos', 'World of Warcraft'],
        characters: ['Артас', 'Тралл', 'Тиранда', 'Архимонд'],
        notes: 'Третья война объединила расы Азерота против общего врага и заложила основы для современного мира.'
    },
    
    'frostmourne-creation': {
        title: 'Создание Ледяной Скорби',
        year: '20 год ОВ',
        category: 'artifacts',
        description: `
            <p>Ледяная Скорбь была создана Нер'зулом, Королём-личом, как ловушка для Артаса. Меч был заключён в лёд в пещерах Нордскола, охраняемый нежитью.</p>
            
            <p>Когда Артас прибыл в Нордскол в поисках Мал'Ганиса, он обнаружил меч и, несмотря на предупреждения Мурадина Бронзобороды, разбил лёд, чтобы получить оружие.</p>
            
            <p>Взяв Ледяную Скорбь, Артас потерял свою душу и стал рыцарем смерти на службе у Короля-лича. Меч стал символом его падения и проклятия.</p>
        `,
        images: [
            'https://via.placeholder.com/300x200/87ceeb/ffffff?text=Ледяная+Скорбь',
            'https://via.placeholder.com/300x200/4169e1/ffffff?text=Нордскол'
        ],
        videos: [
            {
                title: 'История Ледяной Скорби',
                url: 'https://www.youtube.com/watch?v=example10'
            }
        ],
        books: [
            {
                title: 'Артас: Восхождение Короля-лича',
                cover: '📚'
            },
            {
                title: 'Warcraft Chronicle Volume 3',
                cover: '📖'
            }
        ],
        games: ['Warcraft III', 'World of Warcraft: Wrath of the Lich King'],
        characters: ['Артас', 'Нер\'зул', 'Мурадин'],
        notes: 'Ледяная Скорбь стала одним из самых проклятых артефактов в истории Азерота.'
    }
};

// Данные персонажей
const charactersData = {
    'arthas': {
        name: 'Артас Менетил',
        title: 'Король-лич',
        portrait: 'https://via.placeholder.com/150x200/4fc3f7/ffffff?text=Артас',
        biography: `
            <p>Артас Менетил был принцем Лордерона и паладином Света, который стал одной из самых трагических фигур в истории Азерота. Его падение началось с благородного желания защитить свой народ от Плети.</p>
            
            <p>В попытке остановить распространение чумы нежити, Артас принял ряд морально сомнительных решений, включая резню в Стратхольме. Его одержимость местью привела его в Нордскол, где он взял проклятый меч Ледяная Скорбь.</p>
            
            <p>Меч поглотил его душу, превратив в рыцаря смерти на службе у Короля-лича Нер'зула. Позже Артас слился с Нер'зулом, став новым Королём-личом и правителем Плети.</p>
        `,
        role: 'Главный антагонист Warcraft III и Wrath of the Lich King',
        games: ['Warcraft III', 'World of Warcraft: Wrath of the Lich King'],
        books: ['Артас: Восхождение Короля-лича']
    },
    
    'illidan': {
        name: 'Иллидан Ярость Бури',
        title: 'Охотник на демонов',
        portrait: 'https://via.placeholder.com/150x200/32cd32/ffffff?text=Иллидан',
        biography: `
            <p>Иллидан Ярость Бури — ночной эльф, ставший первым охотником на демонов. Брат-близнец Малфуриона, он всегда жил в тени своего более талантливого брата и соперничал с ним за внимание Тиранды.</p>
            
            <p>Во время Войны Древних Иллидан поглотил силы демонов, чтобы лучше сражаться с ними. Это решение привело к его изгнанию и заключению на 10,000 лет.</p>
            
            <p>Освобождённый во время Третьей войны, Иллидан продолжил свою борьбу против Пылающего Легиона, используя их же силы против них. Он стал повелителем Запределья и основал орден охотников на демонов.</p>
        `,
        role: 'Антигерой, основатель ордена охотников на демонов',
        games: ['Warcraft III', 'World of Warcraft: The Burning Crusade', 'World of Warcraft: Legion'],
        books: ['Иллидан', 'Warcraft Chronicle Volume 3']
    },
    
    'thrall': {
        name: 'Тралл',
        title: 'Вождь Орды',
        portrait: 'https://via.placeholder.com/150x200/ffd700/000000?text=Тралл',
        biography: `
            <p>Тралл, рождённый как Го'эл, стал одним из величайших лидеров в истории орков. Воспитанный людьми как гладиатор, он узнал о своём наследии и освободил свой народ от демонического влияния.</p>
            
            <p>Под его руководством орки основали новую Орду, основанную на чести и шаманских традициях, а не на кровожадности. Тралл привёл орков в Калимдор и основал Оргриммар.</p>
            
            <p>Как шаман, Тралл обладает глубокой связью со стихиями и сыграл ключевую роль в спасении мира от Смертокрыла и других угроз. Он временно служил Аспектом Земли.</p>
        `,
        role: 'Вождь Орды, шаман стихий, освободитель орков',
        games: ['Warcraft III', 'World of Warcraft', 'World of Warcraft: Cataclysm'],
        books: ['Тралл: Сумерки аспектов', 'Повелитель кланов']
    },
    
    'jaina': {
        name: 'Джайна Праудмур',
        title: 'Архимаг Кул-Тираса',
        portrait: 'https://via.placeholder.com/150x200/87ceeb/000000?text=Джайна',
        biography: `
            <p>Джайна Праудмур — одна из самых могущественных волшебниц Азерота и дочь адмирала Дэлина Праудмура. Она была ученицей Антонидаса в Даларане и быстро проявила исключительные способности к магии.</p>
            
            <p>Во время Третьей войны Джайна сыграла ключевую роль в объединении рас против Пылающего Легиона. Она основала Терамор и долгое время была сторонницей мира между Альянсом и Ордой.</p>
            
            <p>После разрушения Терамора Джайна стала более жёсткой в отношении Орды. Она стала лидером Кирин Тора и правительницей Кул-Тираса, продолжая защищать Азерот от магических угроз.</p>
        `,
        role: 'Архимаг, правительница Кул-Тираса',
        games: ['Warcraft III', 'World of Warcraft', 'Battle for Azeroth'],
        books: ['Джайна Праудмур: Приливы войны', 'Цикл ненависти']
    },
    
    'sylvanas': {
        name: 'Сильвана Ветрокрылая',
        title: 'Тёмная Госпожа',
        portrait: 'https://via.placeholder.com/150x200/800080/ffffff?text=Сильвана',
        biography: `
            <p>Сильвана Ветрокрылая была рейнджер-генералом Сильвермуна, защищавшей Кель'Талас от угроз. Во время вторжения Плети она героически сражалась против Артаса, но была убита и превращена в банши.</p>
            
            <p>Освободившись от контроля Короля-лича, Сильвана собрала других свободных нежити и основала фракцию Отрёкшихся. Она стала их лидером и присоединилась к Орде для взаимной выгоды.</p>
            
            <p>Как вождь Орды, Сильвана проводила спорную политику, включая использование чумы и сжигание Тельдрассила. Её действия в конечном итоге привели к конфликту с самой Ордой.</p>
        `,
        role: 'Тёмная Госпожа Отрёкшихся, бывший вождь Орды',
        games: ['Warcraft III', 'World of Warcraft', 'Battle for Azeroth', 'Shadowlands'],
        books: ['Сильвана', 'Warcraft Chronicle Volume 3']
    },
    
    'malfurion': {
        name: 'Малфурион Ярость Бури',
        title: 'Архидруид',
        portrait: 'https://via.placeholder.com/150x200/228b22/ffffff?text=Малфурион',
        biography: `
            <p>Малфурион Ярость Бури — первый друид и один из величайших героев ночных эльфов. Брат-близнец Иллидана, он выбрал путь друидизма под руководством полубога Кенария.</p>
            
            <p>Во время Войны Древних Малфурион сыграл ключевую роль в победе над Пылающим Легионом. Он помог разрушить Колодец Вечности и спас мир от демонического вторжения.</p>
            
            <p>Как архидруид, Малфурион защищает природу и ведёт ночных эльфов. Он провёл тысячи лет в Изумрудном Сне, но всегда возвращается, когда Азероту угрожает опасность.</p>
        `,
        role: 'Архидруид, лидер ночных эльфов',
        games: ['Warcraft III', 'World of Warcraft', 'Legion'],
        books: ['Война Древних трилогия', 'Малфурион']
    },
    
    'tyrande': {
        name: 'Тиранда Шелест Ветра',
        title: 'Верховная Жрица Элуны',
        portrait: 'https://via.placeholder.com/150x200/c0c0c0/000000?text=Тиранда',
        biography: `
            <p>Тиранда Шелест Ветра — верховная жрица богини луны Элуны и лидер ночных эльфов. Она служит своему народу уже более 10,000 лет, сочетая мудрость с непоколебимой решимостью.</p>
            
            <p>Во время Войны Древних Тиранда сражалась бок о бок с Малфурионом против Пылающего Легиона. Её любовь к Малфуриону и дружба с Иллиданом сформировали сложные отношения между братьями.</p>
            
            <p>Как лидер ночных эльфов, Тиранда защищает Калимдор и священные места своего народа. Она обладает благословением Элуны и может призывать силу луны в бою.</p>
        `,
        role: 'Верховная жрица Элуны, лидер ночных эльфов',
        games: ['Warcraft III', 'World of Warcraft', 'Battle for Azeroth'],
        books: ['Война Древних трилогия', 'Тиранда и Малфурион']
    },
    
    'varian': {
        name: 'Вариан Ринн',
        title: 'Король Штормграда',
        portrait: 'https://via.placeholder.com/150x200/4169e1/ffffff?text=Вариан',
        biography: `
            <p>Вариан Ринн был королём Штормграда и одним из величайших лидеров Альянса. Сын короля Ллейна, он пережил трагическую юность, включая смерть отца и собственное похищение.</p>
            
            <p>После возвращения Вариан объединил Альянс и повёл его через множество конфликтов. Он был известен своей храбростью в бою и мудростью в управлении государством.</p>
            
            <p>Вариан пожертвовал собой во время вторжения Легиона, сдерживая демонов, чтобы позволить другим героям спастись. Его смерть стала поворотным моментом в войне против Легиона.</p>
        `,
        role: 'Король Штормграда, лидер Альянса',
        games: ['World of Warcraft', 'Legion'],
        books: ['Вариан Ринн: Кровь и честь', 'Warcraft: Легенды']
    },
    
    'garrosh': {
        name: 'Гаррош Адский Крик',
        title: 'Бывший Вождь Орды',
        portrait: 'https://via.placeholder.com/150x200/8b4513/ffffff?text=Гаррош',
        biography: `
            <p>Гаррош Адский Крик — сын легендарного Громмаша Адского Крика, ставший одной из самых противоречивых фигур в истории Орды. Изначально он был неуверенным в себе орком из клана Песнопевцев.</p>
            
            <p>Под влиянием Тралла Гаррош обрёл уверенность и стал военачальником. Однако его назначение вождём Орды привело к радикализации его взглядов и превращению в тирана.</p>
            
            <p>Гаррош развязал войну против Альянса, использовал запрещённые методы и в конечном итоге был свергнут собственной Ордой. Его побег в альтернативный Дренор привёл к созданию Железной Орды.</p>
        `,
        role: 'Бывший вождь Орды, военный преступник',
        games: ['World of Warcraft', 'Mists of Pandaria', 'Warlords of Draenor'],
        books: ['Гаррош: Сердце войны', 'Warcraft Chronicle Volume 3']
    },
    
    'kaelthas': {
        name: 'Кель\'тас Солнечный Скиталец',
        title: 'Принц эльфов крови',
        portrait: 'https://via.placeholder.com/150x200/ff6347/ffffff?text=Кель\'тас',
        biography: `
            <p>Кель'тас Солнечный Скиталец был принцем высших эльфов и одним из величайших магов своего времени. После разрушения Солнечного Колодца он повёл выживших эльфов, которые стали называться эльфами крови.</p>
            
            <p>В поисках способа утолить магическую зависимость своего народа, Кель'тас присоединился к Иллидану в Запределье. Там он изучал демоническую магию и искал новые источники силы.</p>
            
            <p>Одержимость магией и отчаяние привели Кель'таса к союзу с Пылающим Легионом. Он предал своих союзников и был в конечном итоге побеждён героями, которые когда-то считали его лидером.</p>
        `,
        role: 'Принц эльфов крови, маг, предатель',
        games: ['Warcraft III', 'World of Warcraft: The Burning Crusade'],
        books: ['Кель\'тас: Последний из Солнечных Скитальцев', 'Warcraft Chronicle Volume 3']
    }
};

// Класс для управления сайтом
class WarcraftTimeline {
    constructor() {
        this.modal = document.getElementById('scrollModal');
        this.characterModal = document.getElementById('characterModal');
        this.editEventModal = document.getElementById('editEventModal');
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.pageContents = document.querySelectorAll('.page-content');
        this.timelineEvents = document.querySelectorAll('.timeline-event');
        this.characterCards = document.querySelectorAll('.character-card');
        this.editModeBtn = document.getElementById('editModeBtn');
        this.addEventBtn = document.getElementById('addEventBtn');
        this.editEventForm = document.getElementById('editEventForm');
        
        this.isEditMode = false;
        this.currentEditingEvent = null;
        this.eventCounter = 1000; // Для генерации уникальных ID
        
        this.init();
    }
    
    init() {
        this.loadFromLocalStorage();
        this.bindEvents();
        this.createEventListeners();
        this.animateTimelineOnLoad();
    }
    
    bindEvents() {
        // Навигация между страницами
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchPage(e));
        });
        
        // Закрытие модального окна событий
        const closeBtn = this.modal.querySelector('.scroll-close');
        const overlay = this.modal.querySelector('.scroll-overlay');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        overlay.addEventListener('click', () => this.closeModal());
        
        // Закрытие модального окна персонажей
        const characterCloseBtn = this.characterModal.querySelector('.character-modal-close');
        const characterOverlay = this.characterModal.querySelector('.character-modal-overlay');
        
        characterCloseBtn.addEventListener('click', () => this.closeCharacterModal());
        characterOverlay.addEventListener('click', () => this.closeCharacterModal());
        
        // Закрытие модального окна редактирования
        const editCloseBtn = this.editEventModal.querySelector('.edit-modal-close');
        const editOverlay = this.editEventModal.querySelector('.edit-modal-overlay');
        const cancelBtn = document.getElementById('cancelEdit');
        
        editCloseBtn.addEventListener('click', () => this.closeEditModal());
        editOverlay.addEventListener('click', () => this.closeEditModal());
        cancelBtn.addEventListener('click', () => this.closeEditModal());
        
        // Кнопка режима редактирования
        this.editModeBtn.addEventListener('click', () => this.toggleEditMode());
        
        // Кнопка добавления события
        this.addEventBtn.addEventListener('click', () => this.openAddEventModal());
        
        // Форма редактирования события
        this.editEventForm.addEventListener('submit', (e) => this.handleEventSave(e));
        
        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.modal.classList.contains('active')) {
                    this.closeModal();
                }
                if (this.characterModal.classList.contains('active')) {
                    this.closeCharacterModal();
                }
                if (this.editEventModal.classList.contains('active')) {
                    this.closeEditModal();
                }
            }
        });
    }
    
    switchPage(e) {
        const targetPage = e.target.dataset.page;
        
        // Обновляем активную вкладку
        this.navTabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        
        // Переключаем страницы
        this.pageContents.forEach(page => page.classList.remove('active'));
        document.getElementById(targetPage + 'Page').classList.add('active');
    }
    
    createEventListeners() {
        // Клики по карточкам событий
        this.timelineEvents.forEach(event => {
            const card = event.querySelector('.event-card');
            
            if (card) {
                card.addEventListener('click', () => {
                    const eventKey = this.getEventKey(event);
                    if (eventKey && timelineData[eventKey]) {
                        this.openModal(timelineData[eventKey]);
                    }
                });
            }
        });
        
        // Клики по карточкам персонажей
        this.characterCards.forEach(card => {
            card.addEventListener('click', () => {
                const characterKey = card.dataset.character;
                if (characterKey && charactersData[characterKey]) {
                    this.openCharacterModal(charactersData[characterKey]);
                }
            });
        });
    }
    
    getEventKey(eventElement) {
        const title = eventElement.querySelector('.event-card h3').textContent;
        const keyMap = {
            'Упорядочивание Азерота': 'titans-ordering',
            'Война Древних': 'war-of-ancients',
            'Основание Кель\'Таласа': 'founding-quelthalas',
            'Первая война': 'first-war',
            'Разрушение Камня Душ': 'soulstone-destruction',
            'Вторая война': 'second-war',
            'Рождение Артаса': 'arthas-birth',
            'Третья война': 'third-war',
            'Создание Ледяной Скорби': 'frostmourne-creation',
            'Падение Артаса': 'arthas-fall',
            'Битва за Гору Хиджал': 'battle-hyjal',
            'Освобождение Иллидана': 'illidan-liberation',
            'Разрушение Ледяной Короны': 'frozen-throne-destruction',
            'Вторжение в Запределье': 'outland-invasion',
            'Смерть Иллидана': 'illidan-death',
            'Война против Короля-лича': 'war-lich-king',
            'Смерть Артаса': 'arthas-death',
            'Катаклизм Смертокрыла': 'deathwing-cataclysm',
            'Война в Пандарии': 'pandaria-war',
            'Падение Гарроша': 'garrosh-fall',
            'Железная Орда': 'iron-horde',
            'Вторжение Легиона': 'legion-invasion',
            'Возвращение Иллидана': 'illidan-return',
            'Война за Азерот': 'battle-azeroth'
        };
        return keyMap[title];
    }
    
    handleFilter(e) {
        const filter = e.target.dataset.filter;
        
        // Обновляем активную кнопку
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Фильтруем события
        this.timelineEvents.forEach(event => {
            const category = event.dataset.category;
            
            if (filter === 'all' || category === filter) {
                event.style.display = 'flex';
                event.style.animation = 'fadeInEvent 0.5s ease-out forwards';
            } else {
                event.style.display = 'none';
            }
        });
    }
    
    openModal(eventData) {
        const modal = this.modal;
        const title = modal.querySelector('.scroll-title');
        const description = modal.querySelector('.content-section:nth-child(1)');
        const imageGallery = modal.querySelector('.image-gallery');
        const videoLinks = modal.querySelector('.video-links');
        const notes = modal.querySelector('.notes');
        
        // Заполняем контент
        title.textContent = eventData.title;
        
        // Описание с исправленными ссылками
        description.innerHTML = `<h3>Описание</h3>${eventData.description}`;
        
        // Исправляем ссылки на персонажей
        const characterLinks = description.querySelectorAll('.character-link');
        characterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const characterKey = link.dataset.character;
                if (characterKey && charactersData[characterKey]) {
                    this.closeModal();
                    setTimeout(() => {
                        this.openCharacterModal(charactersData[characterKey]);
                    }, 300);
                }
            });
        });
        
        // Изображения
        imageGallery.innerHTML = '';
        if (eventData.images && eventData.images.length > 0) {
            eventData.images.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.style.cssText = `
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 2px solid #8b4513;
                `;
                imageGallery.appendChild(img);
            });
        }
        
        // Видео
        videoLinks.innerHTML = '';
        if (eventData.videos && eventData.videos.length > 0) {
            eventData.videos.forEach(video => {
                const link = document.createElement('a');
                link.href = video.url;
                link.textContent = `🎬 ${video.title}`;
                link.className = 'video-link';
                link.target = '_blank';
                videoLinks.appendChild(link);
            });
        }
        
        // Добавляем секции для книг и игр
        const scrollBody = modal.querySelector('.scroll-body');
        
        // Удаляем старые секции книг и игр, если они есть
        const existingBooksSection = scrollBody.querySelector('.books-section');
        const existingGamesSection = scrollBody.querySelector('.games-section');
        if (existingBooksSection) existingBooksSection.remove();
        if (existingGamesSection) existingGamesSection.remove();
        
        // Добавляем секцию книг
        if (eventData.books && eventData.books.length > 0) {
            const booksSection = document.createElement('div');
            booksSection.className = 'content-section books-section';
            booksSection.innerHTML = `
                <h3>Связанные книги</h3>
                <div class="related-books">
                    ${eventData.books.map(book => `
                        <div class="book-item">
                            <div class="book-cover">${book.cover}</div>
                            <span>${book.title}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            scrollBody.appendChild(booksSection);
        }
        
        // Добавляем секцию игр
        if (eventData.games && eventData.games.length > 0) {
            const gamesSection = document.createElement('div');
            gamesSection.className = 'content-section games-section';
            gamesSection.innerHTML = `
                <h3>Появления в играх</h3>
                <div class="related-games">
                    ${eventData.games.map(game => `
                        <span class="game-tag">${game}</span>
                    `).join('')}
                </div>
            `;
            scrollBody.appendChild(gamesSection);
        }
        
        // Заметки
        notes.textContent = eventData.notes || 'Дополнительные заметки отсутствуют.';
        
        // Показываем модальное окно
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Звуковой эффект (если нужен)
        this.playScrollSound();
    }
    
    openCharacterModal(characterData) {
        const modal = this.characterModal;
        const portrait = modal.querySelector('#modalCharacterPortrait');
        const name = modal.querySelector('#modalCharacterName');
        const title = modal.querySelector('#modalCharacterTitle');
        const bio = modal.querySelector('#modalCharacterBio');
        
        // Заполняем контент
        portrait.src = characterData.portrait;
        portrait.alt = characterData.name;
        name.textContent = characterData.name;
        title.textContent = characterData.title;
        bio.innerHTML = characterData.biography;
        
        // Показываем модальное окно
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeCharacterModal() {
        this.characterModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Анимация сворачивания
        const scrollContainer = this.modal.querySelector('.scroll-container');
        scrollContainer.style.animation = 'scrollRoll 0.5s ease-in forwards';
        
        setTimeout(() => {
            scrollContainer.style.animation = '';
        }, 500);
    }
    
    playScrollSound() {
        // Здесь можно добавить звуковые эффекты
        // const audio = new Audio('sounds/scroll-open.mp3');
        // audio.play().catch(() => {});
    }
    
    animateTimelineOnLoad() {
        // Анимация появления событий при загрузке
        this.timelineEvents.forEach((event, index) => {
            event.style.animationDelay = `${index * 0.2}s`;
        });
        
        // Эффект прокрутки для таймлинии
        this.setupScrollEffects();
    }
    
    setupScrollEffects() {
        const timelineLine = document.querySelector('.timeline-line');
        let ticking = false;
        
        function updateTimeline() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Эффект параллакса для линии времени
            timelineLine.style.transform = `translateX(-50%) translateY(${rate}px)`;
            
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateTimeline);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick);
    }
    
    // Методы для режима редактирования
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        
        if (this.isEditMode) {
            this.editModeBtn.classList.add('active');
            this.addEventBtn.style.display = 'flex';
            document.body.classList.add('edit-mode');
            this.enableEventEditing();
        } else {
            this.editModeBtn.classList.remove('active');
            this.addEventBtn.style.display = 'none';
            document.body.classList.remove('edit-mode');
            this.disableEventEditing();
        }
    }
    
    enableEventEditing() {
        this.timelineEvents.forEach(event => {
            const card = event.querySelector('.event-card');
            if (card) {
                card.addEventListener('click', this.handleEventEdit.bind(this));
                card.style.cursor = 'pointer';
            }
        });
    }
    
    disableEventEditing() {
        this.timelineEvents.forEach(event => {
            const card = event.querySelector('.event-card');
            if (card) {
                card.removeEventListener('click', this.handleEventEdit.bind(this));
                card.style.cursor = 'pointer';
            }
        });
    }
    
    handleEventEdit(e) {
        if (!this.isEditMode) return;
        
        e.stopPropagation();
        const eventElement = e.target.closest('.timeline-event');
        const eventKey = this.getEventKey(eventElement);
        
        if (eventKey && timelineData[eventKey]) {
            this.currentEditingEvent = eventKey;
            this.openEditEventModal(timelineData[eventKey]);
        }
    }
    
    openAddEventModal() {
        this.currentEditingEvent = null;
        document.getElementById('editModalTitle').textContent = 'Добавить событие';
        this.clearEditForm();
        this.editEventModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    openEditEventModal(eventData) {
        document.getElementById('editModalTitle').textContent = 'Редактировать событие';
        this.fillEditForm(eventData);
        this.editEventModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeEditModal() {
        this.editEventModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentEditingEvent = null;
    }
    
    clearEditForm() {
        this.editEventForm.reset();
    }
    
    fillEditForm(eventData) {
        document.getElementById('eventTitle').value = eventData.title || '';
        document.getElementById('eventYear').value = eventData.year || '';
        document.getElementById('eventDescription').value = this.stripHtml(eventData.description) || '';
        
        // Определяем позицию события на основе существующего элемента
        const eventElement = this.findEventElementByKey(this.currentEditingEvent);
        if (eventElement) {
            const position = eventElement.classList.contains('left') ? 'left' : 'right';
            document.getElementById('eventPosition').value = position;
        }
        
        // Заполняем изображения
        if (eventData.images && eventData.images.length > 0) {
            document.getElementById('eventImages').value = eventData.images.join('\n');
        }
        
        // Заполняем видео
        if (eventData.videos && eventData.videos.length > 0) {
            const videoText = eventData.videos.map(v => `${v.title}|${v.url}`).join('\n');
            document.getElementById('eventVideos').value = videoText;
        }
        
        // Заполняем книги
        if (eventData.books && eventData.books.length > 0) {
            const booksText = eventData.books.map(b => `${b.title}|${b.cover}`).join('\n');
            document.getElementById('eventBooks').value = booksText;
        }
        
        // Заполняем игры
        if (eventData.games && eventData.games.length > 0) {
            document.getElementById('eventGames').value = eventData.games.join('\n');
        }
        
        // Заполняем персонажей
        if (eventData.characters && eventData.characters.length > 0) {
            document.getElementById('eventCharacters').value = eventData.characters.join('\n');
        }
        
        // Заполняем заметки
        document.getElementById('eventNotes').value = eventData.notes || '';
    }
    
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
    
    handleEventSave(e) {
        e.preventDefault();
        
        const formData = new FormData(this.editEventForm);
        const eventData = this.processFormData(formData);
        
        if (this.currentEditingEvent) {
            // Редактирование существующего события
            this.updateEvent(this.currentEditingEvent, eventData);
        } else {
            // Добавление нового события
            this.addNewEvent(eventData);
        }
        
        this.closeEditModal();
        this.saveToLocalStorage();
    }
    
    processFormData(formData) {
        const data = {
            title: formData.get('title'),
            year: formData.get('year'),
            description: `<p>${formData.get('description').replace(/\n/g, '</p><p>')}</p>`,
            images: this.parseTextarea(formData.get('images')),
            videos: this.parseVideos(formData.get('videos')),
            books: this.parseBooks(formData.get('books')),
            games: this.parseTextarea(formData.get('games')),
            characters: this.parseTextarea(formData.get('characters')),
            notes: formData.get('notes'),
            position: formData.get('position')
        };
        
        return data;
    }
    
    parseTextarea(text) {
        if (!text) return [];
        return text.split('\n').filter(line => line.trim() !== '');
    }
    
    parseVideos(text) {
        if (!text) return [];
        return text.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const [title, url] = line.split('|');
                return { title: title?.trim() || '', url: url?.trim() || '' };
            });
    }
    
    parseBooks(text) {
        if (!text) return [];
        return text.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const [title, cover] = line.split('|');
                return { title: title?.trim() || '', cover: cover?.trim() || '📚' };
            });
    }
    
    updateEvent(eventKey, eventData) {
        // Обновляем данные в timelineData
        timelineData[eventKey] = { ...timelineData[eventKey], ...eventData };
        
        // Находим и обновляем элемент в DOM
        const eventElement = this.findEventElementByKey(eventKey);
        if (eventElement) {
            const titleElement = eventElement.querySelector('.event-card h3');
            const yearElement = eventElement.querySelector('.event-year');
            
            if (titleElement) titleElement.textContent = eventData.title;
            if (yearElement) yearElement.textContent = eventData.year;
            
            // Обновляем позицию события
            if (eventData.position) {
                eventElement.classList.remove('left', 'right');
                eventElement.classList.add(eventData.position);
            }
            
            // Обновляем год для сортировки
            eventElement.dataset.year = this.extractYear(eventData.year);
        }
    }
    
    addNewEvent(eventData) {
        // Генерируем уникальный ключ
        const eventKey = `custom-event-${this.eventCounter++}`;
        
        // Добавляем в данные
        timelineData[eventKey] = eventData;
        
        // Создаем новый элемент в DOM
        this.createEventElement(eventKey, eventData);
        
        // Обновляем обработчики событий
        this.timelineEvents = document.querySelectorAll('.timeline-event');
        this.createEventListeners();
        if (this.isEditMode) {
            this.enableEventEditing();
        }
    }
    
    createEventElement(eventKey, eventData) {
        const timelineEventsContainer = document.querySelector('.timeline-events');
        const position = eventData.position || 'right';
        
        const eventElement = document.createElement('div');
        eventElement.className = `timeline-event ${position}`;
        eventElement.dataset.year = this.extractYear(eventData.year);
        
        eventElement.innerHTML = `
            <div class="event-card">
                <h3>${eventData.title}</h3>
                <span class="event-year">${eventData.year}</span>
            </div>
        `;
        
        // Добавляем в конец контейнера
        timelineEventsContainer.appendChild(eventElement);
        
        // Анимация появления
        eventElement.style.opacity = '0';
        eventElement.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            eventElement.style.transition = 'all 0.8s ease-out';
            eventElement.style.opacity = '1';
            eventElement.style.transform = 'translateY(0)';
        }, 100);
    }
    
    extractYear(yearString) {
        // Извлекаем числовое значение года для сортировки
        const match = yearString.match(/-?\d+/);
        return match ? parseInt(match[0]) : 0;
    }
    
    findEventElementByKey(eventKey) {
        // Находим элемент события по ключу
        for (const event of this.timelineEvents) {
            const currentKey = this.getEventKey(event);
            if (currentKey === eventKey) {
                return event;
            }
        }
        return null;
    }
    
    saveToLocalStorage() {
        // Сохраняем данные в localStorage для демонстрации
        // В реальном приложении здесь был бы запрос к серверу
        try {
            localStorage.setItem('warcraftTimelineData', JSON.stringify(timelineData));
            this.showNotification('Данные сохранены!', 'success');
        } catch (error) {
            this.showNotification('Ошибка сохранения!', 'error');
        }
    }
    
    loadFromLocalStorage() {
        // Загружаем данные из localStorage
        try {
            const savedData = localStorage.getItem('warcraftTimelineData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                Object.assign(timelineData, parsedData);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }
    
    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--fel-green)' : 'var(--void-purple)'};
            color: var(--parchment);
            padding: 15px 25px;
            border-radius: 10px;
            font-family: 'Cinzel', serif;
            font-weight: 600;
            z-index: 5000;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            animation: notificationSlide 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'notificationSlide 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Дополнительные CSS анимации через JavaScript
const additionalStyles = `
    @keyframes scrollRoll {
        0% {
            transform: scaleY(1) rotateX(0deg);
            opacity: 1;
        }
        100% {
            transform: scaleY(0.1) rotateX(-90deg);
            opacity: 0;
        }
    }
    
    .timeline-event.filtered-out {
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    }
    
    .marker-icon {
        transition: all 0.3s ease;
    }
    
    .event-marker:hover .marker-icon {
        transform: scale(1.2);
        filter: drop-shadow(0 0 10px currentColor);
    }
`;

// Добавляем дополнительные стили
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new WarcraftTimeline();
    
    // Дополнительные эффекты
    initParticleEffects();
    initTooltips();
});

// Система частиц для фона
function initParticleEffects() {
    const particlesContainer = document.querySelector('.magic-particles');
    
    // Создаём дополнительные магические частицы
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: var(--arcane-blue);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 5}s linear infinite;
            opacity: ${Math.random() * 0.5 + 0.3};
            box-shadow: 0 0 10px currentColor;
        `;
        
        particlesContainer.appendChild(particle);
    }
}

// Улучшенные тултипы
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = e.target.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(13, 20, 33, 0.95);
                color: var(--parchment);
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.9rem;
                white-space: nowrap;
                z-index: 1000;
                border: 1px solid var(--arcane-blue);
                box-shadow: 0 0 20px rgba(79, 195, 247, 0.5);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            
            setTimeout(() => tooltip.style.opacity = '1', 10);
            
            element.addEventListener('mouseleave', () => {
                tooltip.remove();
            }, { once: true });
        });
    });
}

// Дополнительная CSS анимация для частиц
const particleStyles = `
    @keyframes float {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
    .floating-particle {
        animation-timing-function: linear;
    }
`;

const particleStyleSheet = document.createElement('style');
particleStyleSheet.textContent = particleStyles;
document.head.appendChild(particleStyleSheet);