'use client'

import { useState,useEffect } from 'react'


import Link from 'next/link'


const HomePage = () => {
    // const [topicOptions, setTopicOptions] = useState(topics.python.beginner)

    // const router = useRouter()

    const [language, setLanguage] = useState('SurgicalBasicPrinciples')
    const [difficulty, setDifficulty] = useState('Beginner')
    const [topic, setTopic] = useState('Random')
    const [numQuestions, setNumQuestions] = useState('5')

    const handleSetQuestions = (e) => {}

    const handleLanguageSelect = (e) => {
        
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        console.log(language, difficulty, topic)

        // router.push('/quiz')
    }


    return (

       
        <div className='min-h-screen grid place-items-center bg-cover'>

            

            <div className='border rounded border-white/0 '>
                <h1 className='text-center text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-500 via-pink-400 to-blue-500 bg-clip-text text-transparent q-animate-gradient'>
                    AI Quiz Generator
                </h1>

                {/* <form onSubmit={handleSubmit} className='mt-8 grid grid-cols-[2fr_3fr]'> */}
                <form
                    onSubmit={handleSubmit}
                    className='mt-14 flex flex-col gap-4 w-[80%] mx-auto'
                >
                    {/* <div className='flex flex-col gap-6'> */}
                    <div className='grid grid-cols-2 gap-x-8 gap-y-6'>



                        {/* SUBJECT */}
                        <div className='flex flex-col'>
                                <label
                                    htmlFor='Subject'
                                    className='uppercase text-xs font-semibold'
                                >
                                    Subject
                                </label>
                                <select
                                    name='subject'
                                    id="Subject"
                                    className='quiz-select '
                                >
                                    <option value='Subject1'>Subject 1</option>
                                    <option value='Subject1'>Subject 2</option>
                                    <option value='Subject3'>Subject 3</option>
                                    
                                </select>
                            </div>

                        {/* TOPIC */}
                        <div className='flex flex-col'>
                            <label
                                htmlFor='Topic'
                                className='uppercase text-xs font-semibold'
                            >
                                Topic
                            </label>
                            <select
                                id="Topic"
                                name='Topic'
                                className='quiz-select'
                            >
                                <option value='Topic1'>Topic 1</option>
                                <option value='Topic2'>Topic 2</option>
                                <option value='Topic3'>Topic 3</option>
                                
                            </select>
                        </div>

                        {/* SUB TOPIC */}
                        <div className='flex flex-col'>
                            <label
                                htmlFor='SubTopic'
                                className='uppercase text-xs font-semibold'
                            >
                                Sub Topic
                            </label>
                            <select
                                id="SubTopic"
                                name='topic'
                                className='quiz-select'
                            >
                                <option value="SubTopic1">SubTopic 1</option>
                                <option value="SubTopic2">SubTopic 2</option>
                                <option value="SubTopic3">SubTopic 3</option>
                            </select>
                        </div>

                        {/* DIFFICULTY */}
                        <div className='flex flex-col'>
                            <label
                                htmlFor='difficult'
                                className='uppercase text-xs font-semibold'
                            >
                                Difficulty
                            </label>
                            <select
                                name='difficulty'
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className='quiz-select'
                            >
                                <option value='beginner'>Beginner</option>
                                <option value='intermediate'>
                                    Intermediate
                                </option>
                                <option value='advanced'>Advanced</option>
                            </select>
                        </div>

                        
                    </div>

                    <div className='mx-auto mt-8'>
                        <Link
                            className='q-button'
                            href={{
                                pathname: '/quiz',
                                query: {
                                    language,
                                    difficulty: difficulty.toLowerCase(),
                                    topic: topic.toLowerCase(),
                                    numQuestions,
                                },
                            }}
                        >
                            Generate Quiz
                        </Link>
                    </div>
                </form>
            </div>

            <p
                className='fixed bottom-0 flex items-center gap-2 pb-2 font-bold text-m text-black transition hover:text-purple-500 sm:m-0'
                href='#'
                target='_blank'
            >
                Devloped with love by Glint Ai
            </p>
        </div>

    )
}
export default HomePage
