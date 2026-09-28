                       {/* STEP 1: LOGISTICS */}
                       {step === 1 && (
                          <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8 max-w-3xl mx-auto">
                             
                             {/* Time & Online Controls */}
                             <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                   <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Clock size={16}/> Time & Date</h3>
                                   <div className="flex gap-4">
                                      <div className="flex-1 space-y-1.5">
                                         <Label className="text-xs text-slate-500">Start Time</Label>
                                         <Select value={time.toString()} onValueChange={(v) => setTime(parseInt(v))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                               {[8,9,10,11,12,13,14,15,16,17].map(h => <SelectItem key={h} value={h.toString()}>{h}:00</SelectItem>)}
                                            </SelectContent>
                                         </Select>
                                      </div>
                                      <div className="flex-1 space-y-1.5">
                                         <Label className="text-xs text-slate-500">Duration</Label>
                                         <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                               <SelectItem value="1">1 Hour</SelectItem>
                                               <SelectItem value="2">2 Hours</SelectItem>
                                               <SelectItem value="3">3 Hours</SelectItem>
                                            </SelectContent>
                                         </Select>
                                      </div>
                                      <div className="flex-1 space-y-1.5">
                                         <Label className="text-xs text-slate-500">Repeat</Label>
                                         <Select value={recurrence} onValueChange={setRecurrence}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                               <SelectItem value="none">Does not repeat</SelectItem>
                                               <SelectItem value="daily">Daily</SelectItem>
                                               <SelectItem value="weekly">Weekly</SelectItem>
                                               <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                         </Select>
                                      </div>
                                   </div>
                                </div>

                                <div className="col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                   <div>
                                      <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-1"><LinkIcon size={16}/> Online</h3>
                                      <p className="text-xs text-slate-500">Add meeting link</p>
                                   </div>
                                   <div className="flex items-center justify-between mt-2">
                                      <span className="text-sm font-medium">Generate Link</span>
                                      <Switch checked={hasVC} onCheckedChange={setHasVC} />
                                   </div>
                                </div>
                             </div>

                             {/* Services Section (NEW) */}
                             {selectedRoom && (
                                <div className="space-y-4">
                                   {!smartRooms.find(r => r.id === selectedRoom) && (
                                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
                                         <AlertTriangle size={16} />
                                         <span className="font-medium">Selected room is not available at this time.</span>
                                      </div>
                                   )}
                                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                                      <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Utensils size={16}/> Room Services</h3>
                                      <div className="grid grid-cols-3 gap-4">
                                         <div className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md",
                                            services.catering ? "bg-teal-50 border-teal-500" : "bg-white border-slate-200"
                                         )} onClick={() => setServices({...services, catering: !services.catering})}>
                                            <div className="flex justify-between items-start mb-2">
                                               <Coffee size={20} className={services.catering ? "text-teal-600" : "text-slate-400"} />
                                               {services.catering && <CheckCircle2 size={16} className="text-teal-600" />}
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">Catering</div>
                                            <div className="text-xs text-slate-500">Coffee & Snacks</div>
                                         </div>
 
                                         <div className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md",
                                            services.itSupport ? "bg-teal-50 border-teal-500" : "bg-white border-slate-200"
                                         )} onClick={() => setServices({...services, itSupport: !services.itSupport})}>
                                            <div className="flex justify-between items-start mb-2">
                                               <HelpCircle size={20} className={services.itSupport ? "text-teal-600" : "text-slate-400"} />
                                               {services.itSupport && <CheckCircle2 size={16} className="text-teal-600" />}
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">IT Support</div>
                                            <div className="text-xs text-slate-500">Tech Assist</div>
                                         </div>
 
                                         <div className="border rounded-lg p-3 bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed">
                                            <div className="flex justify-between items-start mb-2">
                                               <Layers size={20} className="text-slate-400" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-900 mb-1">Layout</div>
                                            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                               Standard <Badge variant="secondary" className="h-4 text-[10px] px-1 bg-slate-200 text-slate-500 hover:bg-slate-200">Fixed</Badge>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             )}

                             {/* Room Finding Controls */}
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Building2 size={16}/> Find a Room</h3>
                                   <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2 text-sm text-slate-600">
                                         <Switch id="nearest" checked={nearestToMe} onCheckedChange={setNearestToMe} />
                                         <Label htmlFor="nearest" className="cursor-pointer">Nearest to me (L2)</Label>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-slate-600 w-32">
                                         <Users size={16} />
                                         <Slider value={[capacity]} onValueChange={v => setCapacity(v[0])} max={20} step={1} className="flex-1" />
                                         <span className="w-4 text-right">{capacity}</span>
                                      </div>
                                   </div>
                                </div>

                                <ScrollArea className="h-[300px] border border-slate-200 rounded-xl bg-white">
                                   <div className="p-2 grid grid-cols-2 gap-2">
                                      {smartRooms.map((room: any) => (
                                         <div 
                                            key={room.id}
                                            onClick={() => setSelectedRoom(room.id)}
                                            className={cn(
                                               "relative p-3 rounded-lg border transition-all cursor-pointer flex gap-3 hover:shadow-md group",
                                               selectedRoom === room.id 
                                                  ? "bg-teal-50 border-teal-500 ring-1 ring-teal-500" 
                                                  : "bg-white border-slate-200 hover:border-slate-300"
                                            )}
                                         >
                                            <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                               <ImageWithFallback src={room.image} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                               <div className="flex justify-between items-start">
                                                  <h4 className="font-bold text-sm text-slate-900 truncate">{room.name}</h4>
                                                  {room.score > 15 && <Badge className="h-4 px-1 text-[10px] bg-teal-100 text-teal-700 hover:bg-teal-100">Best Match</Badge>}
                                               </div>
                                               <div className="text-xs text-slate-500 mt-0.5">{room.floor} • {room.capacity} Seats</div>
                                               <div className="flex gap-1 mt-2">
                                                  {room.features.includes('Video Conf') && <Video size={12} className="text-slate-400" />}
                                                  {room.features.includes('Whiteboard') && <Monitor size={12} className="text-slate-400" />}
                                                  {room.features.includes('Catering') && <Coffee size={12} className="text-slate-400" />}
                                               </div>
                                            </div>
                                            {selectedRoom === room.id && (
                                               <div className="absolute top-2 right-2 bg-teal-600 text-white rounded-full p-0.5">
                                                  <CheckCircle2 size={12} />
                                               </div>
                                            )}
                                            {/* View Map Button Overlay */}
                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                               <Button 
                                                  size="sm" 
                                                  variant="secondary" 
                                                  className="h-6 text-[10px] px-2 bg-white/90 hover:bg-teal-100 text-teal-700 border border-teal-200 shadow-sm"
                                                  onClick={(e) => { e.stopPropagation(); setShowFloorPlan(room); }}
                                               >
                                                  <MapIcon size={10} className="mr-1" /> Map
                                               </Button>
                                            </div>
                                         </div>
                                      ))}
                                      {smartRooms.length === 0 && (
                                         <div className="col-span-2 py-12 text-center text-slate-400">
                                            <Search size={32} className="mx-auto mb-2 opacity-20"/>
                                            <p>No rooms match your specific criteria.</p>
                                            <Button variant="link" onClick={() => {setCapacity(1); setNearestToMe(false);}}>Clear Filters</Button>
                                         </div>
                                      )}
                                   </div>
                                </ScrollArea>
                             </div>
                          </motion.div>
                       )}

                       {/* STEP 2: DETAILS */}
                       {step === 2 && (
                          <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8 max-w-3xl mx-auto">
                             <div className="space-y-6">
                                <div>
                                   <Label className="text-base font-semibold mb-2 block">What is this meeting about?</Label>
                                   <Input 
                                      placeholder="Event Title (e.g. Q3 Roadmap Review)" 
                                      className="h-12 text-lg bg-white"
                                      value={title} onChange={e => setTitle(e.target.value)}
                                      autoFocus
                                   />
                                </div>

                                {/* Visitor Registration Section (only for Client Intent) */}
                                {intent === 'client' && (
                                   <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 space-y-3">
                                      <div className="flex items-center gap-2 text-purple-800 font-semibold">
                                         <BadgeCheck size={18} /> Visitor Registration
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-1">
                                            <Label className="text-xs text-purple-700">Guest Name</Label>
                                            <Input className="bg-white border-purple-200" placeholder="Jane Doe" value={visitorName} onChange={e => setVisitorName(e.target.value)} />
                                         </div>
                                         <div className="space-y-1">
                                            <Label className="text-xs text-purple-700">Company</Label>
                                            <Input className="bg-white border-purple-200" placeholder="Acme Corp" />
                                         </div>
                                      </div>
                                      <p className="text-xs text-purple-600 flex items-center gap-1"><Info size={12}/> Wifi credentials will be emailed automatically.</p>
                                   </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                      <Label>Host (Book on behalf of)</Label>
                                      <Select value={host} onValueChange={setHost}>
                                         <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                         <SelectContent>
                                            <SelectItem value="Me">Me (Myself)</SelectItem>
                                            {INITIAL_COLLEAGUES.map(c => (
                                               <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                            ))}
                                         </SelectContent>
                                      </Select>
                                   </div>
                                   <div className="space-y-2">
                                      <Label>Event Type</Label>
                                      <Select value={intent} onValueChange={setIntent}>
                                         <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                         <SelectContent>
                                            <SelectItem value="internal">Internal Sync</SelectItem>
                                            <SelectItem value="client">Client Meeting</SelectItem>
                                            <SelectItem value="focus">Focus Time</SelectItem>
                                            <SelectItem value="workshop">Workshop</SelectItem>
                                         </SelectContent>
                                      </Select>
                                   </div>
                                </div>

                                <div className="space-y-2">
                                   <div className="flex justify-between items-center">
                                      <Label>Agenda Items</Label>
                                      <Button 
                                         variant="outline" 
                                         size="sm" 
                                         className="h-6 text-xs text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100 hover:text-teal-700 gap-1.5"
                                         onClick={generateAiAgenda}
                                         disabled={!title}
                                      >
                                         <Sparkles size={12} /> Auto-Generate
                                      </Button>
                                   </div>
                                   <div className="bg-white border border-slate-200 rounded-lg p-1 space-y-1">
                                      {agendaItems.map((item, i) => (
                                         <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                                            <span>{i+1}. {item}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => setAgendaItems(agendaItems.filter((_, idx) => idx !== i))}><X size={12}/></Button>
                                         </div>
                                      ))}
                                      <div className="flex items-center gap-2 p-1">
                                         <Input 
                                            placeholder="Add agenda item..." 
                                            className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-9"
                                            value={newAgendaItem}
                                            onChange={e => setNewAgendaItem(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addAgenda()}
                                         />
                                         <Button size="sm" variant="ghost" onClick={addAgenda} disabled={!newAgendaItem}><Plus size={16}/></Button>
                                      </div>
                                   </div>
                                </div>

                                <div 
                                  className={cn(
                                     "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                                     hasAttachments ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-slate-300 bg-slate-50"
                                  )}
                                  onClick={() => setHasAttachments(!hasAttachments)}
                                >
                                   <div className={cn("h-10 w-10 rounded-full flex items-center justify-center mb-2", hasAttachments ? "bg-teal-100 text-teal-600" : "bg-slate-200 text-slate-500")}>
                                      <Paperclip size={20} />
                                   </div>
                                   <p className="text-sm font-medium text-slate-900">
                                      {hasAttachments ? "1 File Attached" : "Attach Files"}
                                   </p>
                                </div>
                             </div>
                          </motion.div>
                       )}