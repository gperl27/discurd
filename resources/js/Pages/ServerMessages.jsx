import React, { useEffect, useRef, useState } from 'react'
import { useForm } from '@inertiajs/inertia-react'
import { Inertia } from '@inertiajs/inertia'

export default function ServerMessages({ server, users, auth }) {
    const { data, setData, post, processing, errors } = useForm({
        text: '',
    })
    const [messagesMutable, setMessagesMutable] = useState(server.messages)
    const [groupIsTyping, setGroupIsTyping] = React.useState({});
    const echoChannel = useRef(Echo.join('server.1'))
    const chatWindowRef = useRef()

    useEffect(() => {
        const fn = () =>
            axios.post(`/servers/${server.id}/users/leave`)

        window.addEventListener('beforeunload', fn)

        return () => {
            window.removeEventListener('beforeunload', fn)
        }
    }, [])

    useEffect(() => {
        const el = chatWindowRef.current
        el.scrollTop = el.scrollHeight;
    }, [])

    useEffect(() => {
        setMessagesMutable(server.messages)
    }, [server.messages])

    useEffect(() => {
        const el = chatWindowRef.current
        if (el.scrollTop >= (el.scrollHeight - el.offsetHeight) * .9) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messagesMutable])

    function appendMessageInTransit(message) {
        setMessagesMutable(messages => [...messages, { id: `in-transit-${Date.now()}`, user_id: '1', server_id: '1', text: message, inTransit: true }])
    }

    useEffect(() => {
        echoChannel.current
            .here((e) => console.log(e, 'here'))
            .joining(() => {
                console.log('joining')
                Inertia.reload({ only: ['users'] })
            })
            .leaving(() => {
                console.log('leaving')
                Inertia.reload({ only: ['users'] })
            })
            .listen('MessageSent', (e) => {
                Inertia.reload({ only: ['server'] })
            })
            .listenForWhisper('typing', (user) => {
                setGroupIsTyping(group => ({ ...group, [user.id]: true }));
            })
            .listenForWhisper('stopTyping', (user) => {
                setGroupIsTyping(group => {
                    const { [user.id]: _, ...nextGroup } = group
                    return nextGroup
                })
            })

    }, [echoChannel])

    async function onSubmit(e) {
        e.preventDefault()
        await post(`/servers/${server.id}/messages`)
        appendMessageInTransit(data.text)
        const el = chatWindowRef.current
        el.scrollTop = el.scrollHeight;
        setData('text', '')
    }

    function onChange(e) {
        if (e.target.value.length > 0) {
            echoChannel.current.whisper('typing', auth.user);
        } else {
            echoChannel.current.whisper('stopTyping', auth.user);
        }
        setData('text', e.target.value)
    }

    return (
        <div>
            <h1>Welcome to {server.name}</h1>
            <hr />
            <h2>Who's here:</h2>
            {
                users.map(user => {
                    return <div key={user.id}>{user.name}</div>
                })
            }
            <hr />
            <div ref={chatWindowRef} style={{ height: '500px', overflowY: 'scroll' }}>
                {
                    messagesMutable.map(message => {
                        return <div key={message.id} style={{ color: message.inTransit ? 'grey' : 'initial' }}>{message.text}</div>
                    })
                }
            </div>
            <hr />
            {Object.keys(groupIsTyping).length > 0 && <strong>Someone is typing...</strong>}
            <form onSubmit={onSubmit}>
                <input type="text" value={data.text} onChange={onChange} />
                <button type="submit" disabled={processing}>Submit</button>
            </form>
            <div>Send a message</div>
        </div>
    )
}