import { useParams } from 'react-router-dom';

export default function PurchaseSuccess() {
    const { ticketId } = useParams();

    const downloadPdf = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('access_token');

        const res = await fetch(`${apiUrl}/tickets/${ticketId}/pdf`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${ticketId}.pdf`;
        a.click();
    };


    return (
        <div style={{
            maxWidth: 600,
            margin: '60px auto',
            background: '#fffde7',
            padding: 30,
            borderRadius: 16,
            boxShadow: '0 2px 12px #ffe066',
            textAlign: 'center'
        }}>
            <h1 style={{ color: '#2b8a3e' }}>
                Purchase Successful!
            </h1>

            <p style={{ fontSize: 16, marginTop: 10 }}>
                Thank you for your purchase!
            </p>



            <button onClick={downloadPdf}
                    style={{
                        width: '50%',
                        margin: '20px auto 0 auto',
                        display: 'block',

                        background: '#ffe066',
                        border: '1px solid #ffd43b',
                        borderRadius: 12,

                        padding: '12px 0',
                        fontWeight: 700,
                        fontSize: 16,

                        cursor: 'pointer',

                        boxShadow: '0 2px 8px #ffe06688',
                        transition: 'all 0.2s ease',

                        textAlign: 'center',
                    }}>
                Download Ticket
            </button>
        </div>
    );
}