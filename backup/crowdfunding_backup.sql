--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gas_fee_logs; Type: TABLE; Schema: public; Owner: davemf
--

CREATE TABLE public.gas_fee_logs (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    donator_address character varying(42) NOT NULL,
    donation_amount character varying(255) NOT NULL,
    gas_fee character varying(255) NOT NULL,
    max_fee character varying(255),
    gas_price character varying(255),
    gas_limit character varying(255),
    contract_version character varying(50) NOT NULL,
    is_success boolean DEFAULT true,
    campaign_title character varying(255),
    method_name character varying(50),
    batch_id character varying(255),
    batch_index integer,
    batch_size integer,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.gas_fee_logs OWNER TO davemf;

--
-- Name: COLUMN gas_fee_logs.batch_id; Type: COMMENT; Schema: public; Owner: davemf
--

COMMENT ON COLUMN public.gas_fee_logs.batch_id IS 'ID untuk mengelompokkan transaksi batch (biasanya transaction hash)';


--
-- Name: COLUMN gas_fee_logs.batch_index; Type: COMMENT; Schema: public; Owner: davemf
--

COMMENT ON COLUMN public.gas_fee_logs.batch_index IS 'Urutan donasi dalam batch (0, 1, 2, dst)';


--
-- Name: COLUMN gas_fee_logs.batch_size; Type: COMMENT; Schema: public; Owner: davemf
--

COMMENT ON COLUMN public.gas_fee_logs.batch_size IS 'Total jumlah donasi dalam batch';


--
-- Name: gas_fee_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: davemf
--

CREATE SEQUENCE public.gas_fee_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gas_fee_logs_id_seq OWNER TO davemf;

--
-- Name: gas_fee_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: davemf
--

ALTER SEQUENCE public.gas_fee_logs_id_seq OWNED BY public.gas_fee_logs.id;


--
-- Name: gas_fee_logs id; Type: DEFAULT; Schema: public; Owner: davemf
--

ALTER TABLE ONLY public.gas_fee_logs ALTER COLUMN id SET DEFAULT nextval('public.gas_fee_logs_id_seq'::regclass);


--
-- Data for Name: gas_fee_logs; Type: TABLE DATA; Schema: public; Owner: davemf
--

COPY public.gas_fee_logs (id, campaign_id, donator_address, donation_amount, gas_fee, max_fee, gas_price, gas_limit, contract_version, is_success, campaign_title, method_name, batch_id, batch_index, batch_size, "timestamp") FROM stdin;
226	3	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000249831291570432	0	1502509632	166276	original	t	🔵 Light Up a Village	Single Donation	\N	\N	\N	2025-07-13 20:32:05.359599
227	4	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000249783948636332	0	1502224907	166276	original	t	🔵 Startups Need You	Single Donation	\N	\N	\N	2025-07-13 20:32:45.776948
228	5	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000249773180103744	0	1502160144	166276	original	t	🔵 Feed the Hungry with Crypto	Single Donation	\N	\N	\N	2025-07-13 20:33:06.283718
229	6	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000249769462837488	0	1502137788	166276	original	t	🔵 Bridge the Digital Divide	Single Donation	\N	\N	\N	2025-07-13 20:33:30.064831
230	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000249691222663344	0	1501667244	166276	original	t	🔵 Crypto Classroom Project	Single Donation	\N	\N	\N	2025-07-13 20:36:41.991838
231	3	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000146980722369904	0	1501703404	97876	original	t	🔵 Light Up a Village	Single Donation	\N	\N	\N	2025-07-13 20:37:06.676715
232	4	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000146991412288748	0	1501812623	97876	original	t	🔵 Startups Need You	Single Donation	\N	\N	\N	2025-07-13 20:37:29.636981
233	5	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000146979316772668	0	1501689043	97876	original	t	🔵 Feed the Hungry with Crypto	Single Donation	\N	\N	\N	2025-07-13 20:37:53.959824
234	6	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000147005598729816	0	1501957566	97876	original	t	🔵 Bridge the Digital Divide	Single Donation	\N	\N	\N	2025-07-13 20:38:41.728197
235	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000147167552385248	0	1503612248	97876	original	t	🔵 Crypto Classroom Project	Single Donation	\N	\N	\N	2025-07-13 20:39:53.187617
236	3	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.00018911623607511	0	1504337115	125714	variable-packing	t	🟣 Bring Books to Every Child	Single Donation	\N	\N	\N	2025-07-13 20:43:29.945669
237	4	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000189094767015332	0	1504166338	125714	variable-packing	t	🟣 Fresh Food for Remote Villages	Single Donation	\N	\N	\N	2025-07-13 20:43:54.823962
238	5	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000189101310806174	0	1504218391	125714	variable-packing	t	🟣 Build a Safe Shelter for Stray Animals	Single Donation	\N	\N	\N	2025-07-13 20:44:15.070872
239	6	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000189112439638024	0	1504306916	125714	variable-packing	t	🟣 Help Orphans Smile Again	Single Donation	\N	\N	\N	2025-07-13 20:44:44.359651
240	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000189101156177954	0	1504217161	125714	variable-packing	t	🟣 Fund Community Garden Projects	Single Donation	\N	\N	\N	2025-07-13 20:45:06.994222
241	3	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000137620447215654	0	1503818511	91514	variable-packing	t	🟣 Bring Books to Every Child	Single Donation	\N	\N	\N	2025-07-13 20:45:50.278301
242	4	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000137590425681898	0	1503490457	91514	variable-packing	t	🟣 Fresh Food for Remote Villages	Single Donation	\N	\N	\N	2025-07-13 20:46:19.72046
243	5	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.00013755788586589	0	1503134885	91514	variable-packing	t	🟣 Build a Safe Shelter for Stray Animals	Single Donation	\N	\N	\N	2025-07-13 20:46:54.204352
244	6	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000137553251413902	0	1503084243	91514	variable-packing	t	🟣 Help Orphans Smile Again	Single Donation	\N	\N	\N	2025-07-13 20:47:18.737153
245	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000137530267306746	0	1502833089	91514	variable-packing	t	🟣 Fund Community Garden Projects	Single Donation	\N	\N	\N	2025-07-13 20:47:40.42018
246	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000188025682292032	0	1502378566	125152	optimized	t	🟢 Crypto Meals Weekly	Single Donation	\N	\N	\N	2025-07-13 20:48:40.125417
247	8	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.0001879920926216	0	1502110175	125152	optimized	t	🟢 Rebuild School Facilities	Single Donation	\N	\N	\N	2025-07-13 20:49:04.951948
248	9	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000187973771495168	0	1501963784	125152	optimized	t	🟢 Support Local Artists	Single Donation	\N	\N	\N	2025-07-13 20:49:32.714306
249	10	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000187971809487264	0	1501948107	125152	optimized	t	🟢 Clean Energy Starter Kit	Single Donation	\N	\N	\N	2025-07-13 20:49:55.018775
250	11	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000187960732784352	0	1501859601	125152	optimized	t	🟢 Hope Through Microloans	Single Donation	\N	\N	\N	2025-07-13 20:50:15.795333
251	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000136566109975336	0	1501518493	90952	optimized	t	🟢 Crypto Meals Weekly	Single Donation	\N	\N	\N	2025-07-13 20:51:39.397714
252	8	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000136552606604752	0	1501370026	90952	optimized	t	🟢 Rebuild School Facilities	Single Donation	\N	\N	\N	2025-07-13 20:52:05.705721
253	9	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000136541955852696	0	1501252923	90952	optimized	t	🟢 Support Local Artists	Single Donation	\N	\N	\N	2025-07-13 20:52:31.095898
254	10	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000136531667635312	0	1501139806	90952	optimized	t	🟢 Clean Energy Starter Kit	Single Donation	\N	\N	\N	2025-07-13 20:53:17.063871
255	11	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000136521454453328	0	1501027514	90952	optimized	t	🟢 Hope Through Microloans	Single Donation	\N	\N	\N	2025-07-13 20:53:54.583044
256	28	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000964199631804535	0	1500973145	642383	batch-processing	t	🟠 Daily Meals for School Kids	Batch Donation	0x3877e860cb2bc5e186f4cc32f5e479cc8b2e818ab7cc1a40f099f1848417d75d	0	5	2025-07-13 20:54:53.975954
257	30	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000964199631804535	0	1500973145	642383	batch-processing	t	🟠 Safe Drinking Water for Everyone	Batch Donation	0x3877e860cb2bc5e186f4cc32f5e479cc8b2e818ab7cc1a40f099f1848417d75d	1	5	2025-07-13 20:54:54.023243
258	29	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000964199631804535	0	1500973145	642383	batch-processing	t	🟠 Donate School Supplies Today	Batch Donation	0x3877e860cb2bc5e186f4cc32f5e479cc8b2e818ab7cc1a40f099f1848417d75d	2	5	2025-07-13 20:54:54.058629
259	31	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000964199631804535	0	1500973145	642383	batch-processing	t	🟠 Free Glasses for Students in Need	Batch Donation	0x3877e860cb2bc5e186f4cc32f5e479cc8b2e818ab7cc1a40f099f1848417d75d	3	5	2025-07-13 20:54:54.104912
260	32	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000964199631804535	0	1500973145	642383	batch-processing	t	🟠 Rebuild After the Storm	Batch Donation	0x3877e860cb2bc5e186f4cc32f5e479cc8b2e818ab7cc1a40f099f1848417d75d	4	5	2025-07-13 20:54:54.130964
261	28	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000579290200969135	0	1501206845	385883	batch-processing	t	🟠 Daily Meals for School Kids	Batch Donation	0x1542810a0e53154cae20cf0de369fef513d91f6233fbe483134ba8922b18414b	0	5	2025-07-13 20:55:42.934405
262	31	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000579290200969135	0	1501206845	385883	batch-processing	t	🟠 Free Glasses for Students in Need	Batch Donation	0x1542810a0e53154cae20cf0de369fef513d91f6233fbe483134ba8922b18414b	1	5	2025-07-13 20:55:42.965916
263	30	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000579290200969135	0	1501206845	385883	batch-processing	t	🟠 Safe Drinking Water for Everyone	Batch Donation	0x1542810a0e53154cae20cf0de369fef513d91f6233fbe483134ba8922b18414b	2	5	2025-07-13 20:55:43.006369
264	29	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000579290200969135	0	1501206845	385883	batch-processing	t	🟠 Donate School Supplies Today	Batch Donation	0x1542810a0e53154cae20cf0de369fef513d91f6233fbe483134ba8922b18414b	3	5	2025-07-13 20:55:43.036566
265	32	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000579290200969135	0	1501206845	385883	batch-processing	t	🟠 Rebuild After the Storm	Batch Donation	0x1542810a0e53154cae20cf0de369fef513d91f6233fbe483134ba8922b18414b	4	5	2025-07-13 20:55:43.068523
266	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.00056131968255258	0	1501898867	373740	optimized	t	🟢 Crypto Meals Weekly	Batch Donation	0x57cf1b3093ae6fa90c3c65767b44e0b8ba6f5bc9e8eee10fd846340c6103dad0	0	5	2025-07-13 20:56:51.621563
267	9	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.00056131968255258	0	1501898867	373740	optimized	t	🟢 Support Local Artists	Batch Donation	0x57cf1b3093ae6fa90c3c65767b44e0b8ba6f5bc9e8eee10fd846340c6103dad0	1	5	2025-07-13 20:56:51.673408
268	8	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.00056131968255258	0	1501898867	373740	optimized	t	🟢 Rebuild School Facilities	Batch Donation	0x57cf1b3093ae6fa90c3c65767b44e0b8ba6f5bc9e8eee10fd846340c6103dad0	2	5	2025-07-13 20:56:51.705432
269	10	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.00056131968255258	0	1501898867	373740	optimized	t	🟢 Clean Energy Starter Kit	Batch Donation	0x57cf1b3093ae6fa90c3c65767b44e0b8ba6f5bc9e8eee10fd846340c6103dad0	3	5	2025-07-13 20:56:51.734236
270	11	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.00056131968255258	0	1501898867	373740	optimized	t	🟢 Hope Through Microloans	Batch Donation	0x57cf1b3093ae6fa90c3c65767b44e0b8ba6f5bc9e8eee10fd846340c6103dad0	4	5	2025-07-13 20:56:51.761164
271	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000561597776133	0	1502642950	373740	optimized	t	🟢 Crypto Meals Weekly	Batch Donation	0xf6c0c56a522f243682ce8858295c352b116117a1456148a42f3868b5b40971e4	0	5	2025-07-13 20:57:42.92019
272	9	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000561597776133	0	1502642950	373740	optimized	t	🟢 Support Local Artists	Batch Donation	0xf6c0c56a522f243682ce8858295c352b116117a1456148a42f3868b5b40971e4	1	5	2025-07-13 20:57:42.96928
273	8	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000561597776133	0	1502642950	373740	optimized	t	🟢 Rebuild School Facilities	Batch Donation	0xf6c0c56a522f243682ce8858295c352b116117a1456148a42f3868b5b40971e4	2	5	2025-07-13 20:57:43.001007
274	10	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000561597776133	0	1502642950	373740	optimized	t	🟢 Clean Energy Starter Kit	Batch Donation	0xf6c0c56a522f243682ce8858295c352b116117a1456148a42f3868b5b40971e4	3	5	2025-07-13 20:57:43.031698
275	11	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000561597776133	0	1502642950	373740	optimized	t	🟢 Hope Through Microloans	Batch Donation	0xf6c0c56a522f243682ce8858295c352b116117a1456148a42f3868b5b40971e4	4	5	2025-07-13 20:57:43.058766
276	11	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000181904143340352	0	2000001576	90952	optimized	t	🟢 Hope Through Microloans	Single Donation	\N	\N	\N	2025-07-15 10:29:20.408502
277	10	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000181904156619344	0	2000001722	90952	optimized	t	🟢 Clean Energy Starter Kit	Single Donation	\N	\N	\N	2025-07-15 10:29:50.824676
278	9	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000181904131698496	0	2000001448	90952	optimized	t	🟢 Support Local Artists	Single Donation	\N	\N	\N	2025-07-15 10:31:06.460666
279	8	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.00009095212915184	0	1000001420	90952	optimized	t	🟢 Rebuild School Facilities	Single Donation	\N	\N	\N	2025-07-15 10:31:29.376816
280	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000090952128060416	0	1000001408	90952	optimized	t	🟢 Crypto Meals Weekly	Single Donation	\N	\N	\N	2025-07-15 10:32:30.139151
281	11	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000466516362482932	0	2000001554	233258	optimized	t	🟢 Hope Through Microloans	Batch Donation	0x5a4f629906fd94d1a44142539c712ffc6934a80005ddecc88d54c57094367709	0	3	2025-07-15 10:35:55.722286
282	10	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000466516362482932	0	2000001554	233258	optimized	t	🟢 Clean Energy Starter Kit	Batch Donation	0x5a4f629906fd94d1a44142539c712ffc6934a80005ddecc88d54c57094367709	1	3	2025-07-15 10:35:55.766611
283	9	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000466516362482932	0	2000001554	233258	optimized	t	🟢 Support Local Artists	Batch Donation	0x5a4f629906fd94d1a44142539c712ffc6934a80005ddecc88d54c57094367709	2	3	2025-07-15 10:35:55.80093
284	8	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000163017245829636	0	1000001508	163017	optimized	t	🟢 Rebuild School Facilities	Batch Donation	0x14fe8560e989086edab9107bfa2edcdeb8b94aa72014df17836a13303e24ca6a	0	2	2025-07-15 10:36:40.674287
285	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000163017245829636	0	1000001508	163017	optimized	t	🟢 Crypto Meals Weekly	Batch Donation	0x14fe8560e989086edab9107bfa2edcdeb8b94aa72014df17836a13303e24ca6a	1	2	2025-07-15 10:36:40.708564
286	11	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000481678327300201	0	2000001359	240839	batch-processing	t	TestingSmartContractBatch3	Batch Donation	0x68123e41a3179fa06288aa71fda7210d82200d134cc39a621886d8b816f19b28	0	3	2025-07-15 10:40:08.133868
287	10	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000481678327300201	0	2000001359	240839	batch-processing	t	TestingSmartContractBatch2	Batch Donation	0x68123e41a3179fa06288aa71fda7210d82200d134cc39a621886d8b816f19b28	1	3	2025-07-15 10:40:08.171334
288	9	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000481678327300201	0	2000001359	240839	batch-processing	t	TestingSmartContractBatch1	Batch Donation	0x68123e41a3179fa06288aa71fda7210d82200d134cc39a621886d8b816f19b28	2	3	2025-07-15 10:40:08.211431
289	32	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000481678386546595	0	2000001605	240839	batch-processing	t	🟠 Rebuild After the Storm	Batch Donation	0xbe1716606bfff980a7ab5d23faf1654afb28dc2bd625275422b5f76edd403ecf	0	3	2025-07-15 10:42:55.918661
290	31	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000481678386546595	0	2000001605	240839	batch-processing	t	🟠 Free Glasses for Students in Need	Batch Donation	0xbe1716606bfff980a7ab5d23faf1654afb28dc2bd625275422b5f76edd403ecf	1	3	2025-07-15 10:42:55.959341
291	30	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000481678386546595	0	2000001605	240839	batch-processing	t	🟠 Safe Drinking Water for Everyone	Batch Donation	0xbe1716606bfff980a7ab5d23faf1654afb28dc2bd625275422b5f76edd403ecf	2	3	2025-07-15 10:42:56.000004
292	29	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000252475745069552	0	1500001456	168317	batch-processing	t	🟠 Donate School Supplies Today	Batch Donation	0x54cc642550c9b683dfaed9571b8e30864e42338b7e6afde161227b4fb9b929bc	0	2	2025-07-15 10:44:03.479359
293	28	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000252475745069552	0	1500001456	168317	batch-processing	t	🟠 Daily Meals for School Kids	Batch Donation	0x54cc642550c9b683dfaed9571b8e30864e42338b7e6afde161227b4fb9b929bc	1	2	2025-07-15 10:44:03.534569
294	29	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000252475707534861	0	1500001233	168317	batch-processing	t	🟠 Donate School Supplies Today	Batch Donation	0xe7a8072648e8a6de05d1ab7169431bd555664df22a17b84f0a6e8a36c38c0a00	0	2	2025-07-15 10:44:51.672691
295	28	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000252475707534861	0	1500001233	168317	batch-processing	t	🟠 Daily Meals for School Kids	Batch Donation	0xe7a8072648e8a6de05d1ab7169431bd555664df22a17b84f0a6e8a36c38c0a00	1	2	2025-07-15 10:44:51.728925
296	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000183028143310924	0	2000001566	91514	variable-packing	t	🟣 Fund Community Garden Projects	Single Donation	\N	\N	\N	2025-07-15 10:48:04.881773
297	6	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000183028158227706	0	2000001729	91514	variable-packing	t	🟣 Help Orphans Smile Again	Single Donation	\N	\N	\N	2025-07-15 10:48:39.849662
298	5	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000183028153194436	0	2000001674	91514	variable-packing	t	🟣 Build a Safe Shelter for Stray Animals	Single Donation	\N	\N	\N	2025-07-15 10:49:30.915341
299	4	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000091514153194436	0	1000001674	91514	variable-packing	t	🟣 Fresh Food for Remote Villages	Single Donation	\N	\N	\N	2025-07-15 10:49:51.033362
300	3	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000091514159142846	0	1000001739	91514	variable-packing	t	🟣 Bring Books to Every Child	Single Donation	\N	\N	\N	2025-07-15 10:50:40.891369
301	7	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000195752126945172	0	2000001297	97876	original	t	🔵 Crypto Classroom Project	Single Donation	\N	\N	\N	2025-07-15 10:55:27.772847
302	6	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000195752159342128	0	2000001628	97876	original	t	🔵 Bridge the Digital Divide	Single Donation	\N	\N	\N	2025-07-15 10:56:18.779385
303	5	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000195752161299648	0	2000001648	97876	original	t	🔵 Feed the Hungry with Crypto	Single Donation	\N	\N	\N	2025-07-15 10:56:53.376341
304	4	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000097876143094712	0	1000001462	97876	original	t	🔵 Startups Need You	Single Donation	\N	\N	\N	2025-07-15 10:57:29.444145
305	3	0xb9992507b588e57c8466ef6552c16f1bbf8e1fae	0.0001	0.000097876143094712	0	1000001462	97876	original	t	🔵 Light Up a Village	Single Donation	\N	\N	\N	2025-07-15 10:57:52.148482
\.


--
-- Name: gas_fee_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: davemf
--

SELECT pg_catalog.setval('public.gas_fee_logs_id_seq', 305, true);


--
-- Name: gas_fee_logs gas_fee_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: davemf
--

ALTER TABLE ONLY public.gas_fee_logs
    ADD CONSTRAINT gas_fee_logs_pkey PRIMARY KEY (id);


--
-- Name: idx_gas_fee_logs_batch_id; Type: INDEX; Schema: public; Owner: davemf
--

CREATE INDEX idx_gas_fee_logs_batch_id ON public.gas_fee_logs USING btree (batch_id);


--
-- Name: idx_gas_fee_logs_campaign_id; Type: INDEX; Schema: public; Owner: davemf
--

CREATE INDEX idx_gas_fee_logs_campaign_id ON public.gas_fee_logs USING btree (campaign_id);


--
-- Name: idx_gas_fee_logs_contract_version; Type: INDEX; Schema: public; Owner: davemf
--

CREATE INDEX idx_gas_fee_logs_contract_version ON public.gas_fee_logs USING btree (contract_version);


--
-- Name: idx_gas_fee_logs_timestamp; Type: INDEX; Schema: public; Owner: davemf
--

CREATE INDEX idx_gas_fee_logs_timestamp ON public.gas_fee_logs USING btree ("timestamp");


--
-- PostgreSQL database dump complete
--

